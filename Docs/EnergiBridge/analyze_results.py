import os
import glob
import pandas as pd
import numpy as np

RAPL_MAX = 262144.0  # 2^18 Joules (standard RAPL 32-bit MSR rollover)

def calculate_rapl_energy(energy_series):
    values = energy_series.dropna().values
    if len(values) < 2:
        return 0.0
    diffs = np.diff(values)
    total_energy = 0.0
    for d in diffs:
        if d < 0:
            # Gestione overflow registro hardware RAPL
            total_energy += (d + RAPL_MAX)
        else:
            total_energy += d
    return float(total_energy)

def analyze_phase(phase_dir):
    csv_files = sorted(glob.glob(os.path.join(phase_dir, "*.csv")))
    if not csv_files:
        return None
    
    results = []
    
    for file_path in csv_files:
        filename = os.path.basename(file_path)
        try:
            df = pd.read_csv(file_path)
            if df.empty or len(df) < 2:
                continue
            
            # Calcolo durata in secondi
            time_col = df["Time"].values
            duration_sec = (time_col[-1] - time_col[0]) / 1000.0 if len(time_col) > 1 else 0
            if duration_sec <= 0:
                duration_sec = df["Delta"].sum() / 1000.0
            
            # Calcolo Energia Package (CPU totale in Joule) con gestione rollover
            if "PACKAGE_ENERGY (J)" in df.columns:
                total_energy_j = calculate_rapl_energy(df["PACKAGE_ENERGY (J)"])
            elif "SYSTEM_POWER (Watts)" in df.columns:
                power = df["SYSTEM_POWER (Watts)"].mean()
                total_energy_j = power * duration_sec
            else:
                total_energy_j = 0.0
            
            # Calcolo Energia Core (PP0)
            pp0_energy_j = 0.0
            if "PP0_ENERGY (J)" in df.columns:
                pp0_energy_j = calculate_rapl_energy(df["PP0_ENERGY (J)"])

            # Calcolo Energia DRAM (RAM)
            dram_energy_j = 0.0
            if "DRAM_ENERGY (J)" in df.columns:
                dram_energy_j = calculate_rapl_energy(df["DRAM_ENERGY (J)"])

            # Calcolo Potenza Media (Watt = Joule / secondi)
            avg_power_w = (total_energy_j / duration_sec) if duration_sec > 0 else 0.0
            
            # Calcolo Utilizzo Medio CPU (%)
            cpu_cols = [c for c in df.columns if c.startswith("CPU_USAGE_")]
            if cpu_cols:
                avg_cpu_pct = df[cpu_cols].mean().mean()
            else:
                avg_cpu_pct = 0.0
            
            # Memoria media usata in MB
            if "USED_MEMORY" in df.columns:
                avg_ram_mb = df["USED_MEMORY"].mean() / (1024 * 1024)
            else:
                avg_ram_mb = 0.0

            results.append({
                "run": filename,
                "duration_sec": duration_sec,
                "energy_joules": total_energy_j,
                "pp0_energy_j": pp0_energy_j,
                "dram_energy_j": dram_energy_j,
                "power_watts": avg_power_w,
                "cpu_usage_pct": avg_cpu_pct,
                "ram_used_mb": avg_ram_mb
            })
        except Exception as e:
            print(f"Errore nella lettura di {filename}: {e}")
            
    return pd.DataFrame(results)

def process_test_type(test_name, base_dir):
    print(f"\n=======================================================")
    print(f"        REPORT ENERGIBRIDGE - {test_name.upper()} TEST      ")
    print(f"=======================================================\n")
    
    before_dir = os.path.join(base_dir, "raw_data", test_name, "before")
    after_dir = os.path.join(base_dir, "raw_data", test_name, "after")
    
    df_before = analyze_phase(before_dir)
    df_after = analyze_phase(after_dir)
    
    if df_before is not None and not df_before.empty:
        print(f"--- STATISTICHE BEFORE (BASELINE) [{len(df_before)} Run] ---")
        print(f"Durata Media:      {df_before['duration_sec'].mean():.2f} s  (std: {df_before['duration_sec'].std():.2f})")
        print(f"Energia Media CPU: {df_before['energy_joules'].mean():.2f} J  (std: {df_before['energy_joules'].std():.2f})")
        print(f"Energia Media Core:{df_before['pp0_energy_j'].mean():.2f} J  (std: {df_before['pp0_energy_j'].std():.2f})")
        print(f"Potenza Media:     {df_before['power_watts'].mean():.2f} W  (std: {df_before['power_watts'].std():.2f})")
        print(f"Utilizzo CPU:      {df_before['cpu_usage_pct'].mean():.2f} %  (std: {df_before['cpu_usage_pct'].std():.2f})")
        print(f"RAM Media:         {df_before['ram_used_mb'].mean():.2f} MB\n")
    else:
        print(f"Nessun dato valido trovato per BEFORE ({test_name}) in {before_dir}")

    if df_after is not None and not df_after.empty:
        print(f"--- STATISTICHE AFTER (OTTIMIZZATO) [{len(df_after)} Run] ---")
        print(f"Durata Media:      {df_after['duration_sec'].mean():.2f} s  (std: {df_after['duration_sec'].std():.2f})")
        print(f"Energia Media CPU: {df_after['energy_joules'].mean():.2f} J  (std: {df_after['energy_joules'].std():.2f})")
        print(f"Energia Media Core:{df_after['pp0_energy_j'].mean():.2f} J  (std: {df_after['pp0_energy_j'].std():.2f})")
        print(f"Potenza Media:     {df_after['power_watts'].mean():.2f} W  (std: {df_after['power_watts'].std():.2f})")
        print(f"Utilizzo CPU:      {df_after['cpu_usage_pct'].mean():.2f} %  (std: {df_after['cpu_usage_pct'].std():.2f})")
        print(f"RAM Media:         {df_after['ram_used_mb'].mean():.2f} MB\n")
    else:
        print(f"Nessun dato valido trovato per AFTER ({test_name}) in {after_dir}")
        
    if df_before is not None and df_after is not None and not df_before.empty and not df_after.empty:
        e_before = df_before['energy_joules'].mean()
        e_after = df_after['energy_joules'].mean()
        delta_e = ((e_after - e_before) / e_before) * 100
        
        t_before = df_before['duration_sec'].mean()
        t_after = df_after['duration_sec'].mean()
        delta_t = ((t_after - t_before) / t_before) * 100

        p_before = df_before['power_watts'].mean()
        p_after = df_after['power_watts'].mean()
        delta_p = ((p_after - p_before) / p_before) * 100

        print(f"================ CONFRONTO DIRETTO ({test_name.upper()}) ================")
        print(f"[Consumo Energetico]: {e_before:.2f} J -> {e_after:.2f} J  ({delta_e:+.2f}%)")
        print(f"[Tempo Esecuzione]:   {t_before:.2f} s -> {t_after:.2f} s  ({delta_t:+.2f}%)")
        print(f"[Potenza Media]:      {p_before:.2f} W -> {p_after:.2f} W  ({delta_p:+.2f}%)")
        print("=====================================================================\n")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Processa Load, Stress e Browse
    has_load = os.path.exists(os.path.join(base_dir, "raw_data", "load"))
    has_stress = os.path.exists(os.path.join(base_dir, "raw_data", "stress"))
    has_browse = os.path.exists(os.path.join(base_dir, "raw_data", "browse"))
    
    if has_load:
        process_test_type("load", base_dir)
    if has_stress:
        process_test_type("stress", base_dir)
    if has_browse:
        process_test_type("browse", base_dir)

if __name__ == "__main__":
    main()
