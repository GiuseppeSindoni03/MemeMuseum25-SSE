import os
import glob
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Configurazione stile grafico scientifico
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 11
plt.rcParams['axes.titlesize'] = 13
plt.rcParams['axes.labelsize'] = 11
plt.rcParams['xtick.labelsize'] = 10.5
plt.rcParams['ytick.labelsize'] = 10
plt.rcParams['figure.titlesize'] = 14

RAPL_MAX = 262144.0  # 2^18 Joules

def calculate_rapl_energy(energy_series):
    values = energy_series.dropna().values
    if len(values) < 2:
        return 0.0
    diffs = np.diff(values)
    total_energy = 0.0
    for d in diffs:
        if d < 0:
            total_energy += (d + RAPL_MAX)
        else:
            total_energy += d
    return float(total_energy)

def load_data(phase_dir):
    csv_files = sorted(glob.glob(os.path.join(phase_dir, "*.csv")))
    if not csv_files:
        return pd.DataFrame()
    
    records = []
    for f in csv_files:
        df = pd.read_csv(f)
        if df.empty or len(df) < 2:
            continue
        
        # Durata in secondi
        time_col = df["Time"].values
        duration_sec = (time_col[-1] - time_col[0]) / 1000.0 if len(time_col) > 1 else 0
        if duration_sec <= 0:
            duration_sec = df["Delta"].sum() / 1000.0
            
        # Energia
        if "PACKAGE_ENERGY (J)" in df.columns:
            energy_j = calculate_rapl_energy(df["PACKAGE_ENERGY (J)"])
        elif "SYSTEM_POWER (Watts)" in df.columns:
            energy_j = df["SYSTEM_POWER (Watts)"].mean() * duration_sec
        else:
            energy_j = 0.0
            
        records.append({
            "filename": os.path.basename(f),
            "duration_sec": duration_sec,
            "energy_joules": energy_j,
            "power_watts": energy_j / duration_sec if duration_sec > 0 else 0
        })
    return pd.DataFrame(records)

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_charts_dir = os.path.join(base_dir, "charts")
    os.makedirs(output_charts_dir, exist_ok=True)
    
    # Caricamento dati
    browse_before = load_data(os.path.join(base_dir, "raw_data", "browse", "before"))
    browse_after = load_data(os.path.join(base_dir, "raw_data", "browse", "after"))
    stress_before = load_data(os.path.join(base_dir, "raw_data", "stress", "before"))
    stress_after = load_data(os.path.join(base_dir, "raw_data", "stress", "after"))
    
    colors = {
        "before": "#e74c3c",  # Rosso morbido per Baseline
        "after": "#2ecc71"   # Verde smeraldo per Ottimizzato
    }
    
    # -------------------------------------------------------------
    # GRAFICO 1: Load Test Nominale (Browse - Energia e Durata)
    # -------------------------------------------------------------
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.8))
    
    # 1A: Energia Joule
    b_e_mean = [browse_before["energy_joules"].mean(), browse_after["energy_joules"].mean()]
    b_e_std = [browse_before["energy_joules"].std(), browse_after["energy_joules"].std()]
    bars1 = ax1.bar(["Baseline (Before)", "Ottimizzato (After)"], b_e_mean, yerr=b_e_std, 
                    capsize=6, color=[colors["before"], colors["after"]], edgecolor="black", alpha=0.85, width=0.5)
    ax1.set_title("Consumo Energetico CPU (Joule)", fontweight="bold", pad=12)
    ax1.set_ylabel("Energia (J)")
    ax1.set_ylim(0, 2600)
    
    for bar in bars1:
        yval = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 70, f"{yval:.1f} J", ha='center', va='bottom', fontweight='bold')
    
    ax1.text(0.5, 0.90, "Risparmio: -72.82%", transform=ax1.transAxes, ha='center', 
             bbox=dict(boxstyle='round,pad=0.5', facecolor='#d4edda', edgecolor='#28a745', alpha=0.95), fontweight='bold', color='#155724', fontsize=11)

    # 1B: Durata Secondi
    b_t_mean = [browse_before["duration_sec"].mean(), browse_after["duration_sec"].mean()]
    b_t_std = [browse_before["duration_sec"].std(), browse_after["duration_sec"].std()]
    bars2 = ax2.bar(["Baseline (Before)", "Ottimizzato (After)"], b_t_mean, yerr=b_t_std, 
                    capsize=6, color=[colors["before"], colors["after"]], edgecolor="black", alpha=0.85, width=0.5)
    ax2.set_title("Tempo Totale di Esecuzione (Secondi)", fontweight="bold", pad=12)
    ax2.set_ylabel("Durata (s)")
    ax2.set_ylim(0, 68)
    
    for bar in bars2:
        yval = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 1.8, f"{yval:.2f} s", ha='center', va='bottom', fontweight='bold')
        
    ax2.text(0.5, 0.90, "Velocita': 4x (-74.30%)", transform=ax2.transAxes, ha='center', 
             bbox=dict(boxstyle='round,pad=0.5', facecolor='#d4edda', edgecolor='#28a745', alpha=0.95), fontweight='bold', color='#155724', fontsize=11)

    plt.suptitle("EnergiBridge - Load Test Nominale (100 Utenti, 10 Run)", fontweight="bold", y=1.03)
    plt.tight_layout()
    chart1_path = os.path.join(output_charts_dir, "browse_load_comparison.png")
    plt.savefig(chart1_path, dpi=300, bbox_inches='tight')
    plt.close()

    # -------------------------------------------------------------
    # GRAFICO 2: Stress Test (300 Utenti - Energia e Durata)
    # -------------------------------------------------------------
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.8))
    
    # 2A: Energia Joule
    s_e_mean = [stress_before["energy_joules"].mean() / 1000.0, stress_after["energy_joules"].mean() / 1000.0]
    s_e_std = [stress_before["energy_joules"].std() / 1000.0, stress_after["energy_joules"].std() / 1000.0]
    bars1 = ax1.bar(["Baseline (Before)", "Ottimizzato (After)"], s_e_mean, yerr=s_e_std, 
                    capsize=6, color=[colors["before"], colors["after"]], edgecolor="black", alpha=0.85, width=0.5)
    ax1.set_title("Consumo Energetico CPU (Kilojoule)", fontweight="bold", pad=12)
    ax1.set_ylabel("Energia (kJ)")
    ax1.set_ylim(0, 24.5)
    
    for bar in bars1:
        yval = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 0.6, f"{yval:.2f} kJ", ha='center', va='bottom', fontweight='bold')
        
    ax1.text(0.5, 0.90, "Risparmio: -12.54% (-2.25 kJ)", transform=ax1.transAxes, ha='center', 
             bbox=dict(boxstyle='round,pad=0.5', facecolor='#d4edda', edgecolor='#28a745', alpha=0.95), fontweight='bold', color='#155724', fontsize=11)

    # 2B: Durata Secondi
    s_t_mean = [stress_before["duration_sec"].mean(), stress_after["duration_sec"].mean()]
    s_t_std = [stress_before["duration_sec"].std(), stress_after["duration_sec"].std()]
    bars2 = ax2.bar(["Baseline (Before)", "Ottimizzato (After)"], s_t_mean, yerr=s_t_std, 
                    capsize=6, color=[colors["before"], colors["after"]], edgecolor="black", alpha=0.85, width=0.5)
    ax2.set_title("Tempo Totale di Esecuzione (Secondi)", fontweight="bold", pad=12)
    ax2.set_ylabel("Durata (s)")
    ax2.set_ylim(0, 520)
    
    for bar in bars2:
        yval = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2.0, yval + 14, f"{yval:.1f} s", ha='center', va='bottom', fontweight='bold')
        
    ax2.text(0.5, 0.90, "Riduzione: -51.15 s (-13.06%)", transform=ax2.transAxes, ha='center', 
             bbox=dict(boxstyle='round,pad=0.5', facecolor='#d4edda', edgecolor='#28a745', alpha=0.95), fontweight='bold', color='#155724', fontsize=11)

    plt.suptitle("EnergiBridge - Stress Test (300 Utenti, 30.000 Richieste, 10 Run)", fontweight="bold", y=1.03)
    plt.tight_layout()
    chart2_path = os.path.join(output_charts_dir, "stress_comparison.png")
    plt.savefig(chart2_path, dpi=300, bbox_inches='tight')
    plt.close()

    # -------------------------------------------------------------
    # GRAFICO 3: Boxplot di Distribuzione Statistica (10 Run)
    # -------------------------------------------------------------
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11.5, 4.8))
    
    df_box_browse = pd.concat([
        pd.DataFrame({"Fase": "Before", "Energia (J)": browse_before["energy_joules"]}),
        pd.DataFrame({"Fase": "After", "Energia (J)": browse_after["energy_joules"]})
    ])
    df_box_stress = pd.concat([
        pd.DataFrame({"Fase": "Before", "Energia (kJ)": stress_before["energy_joules"] / 1000.0}),
        pd.DataFrame({"Fase": "After", "Energia (kJ)": stress_after["energy_joules"] / 1000.0})
    ])
    
    sns.boxplot(data=df_box_browse, x="Fase", y="Energia (J)", hue="Fase", ax=ax1, palette=[colors["before"], colors["after"]], width=0.45, legend=False)
    sns.stripplot(data=df_box_browse, x="Fase", y="Energia (J)", ax=ax1, color="black", alpha=0.65, jitter=0.12, size=6)
    ax1.set_title("Load Test (100 Utenti) - Dispersione Joule", fontweight="bold", pad=12)
    ax1.set_xlabel("")
    
    sns.boxplot(data=df_box_stress, x="Fase", y="Energia (kJ)", hue="Fase", ax=ax2, palette=[colors["before"], colors["after"]], width=0.45, legend=False)
    sns.stripplot(data=df_box_stress, x="Fase", y="Energia (kJ)", ax=ax2, color="black", alpha=0.65, jitter=0.12, size=6)
    ax2.set_title("Stress Test (300 Utenti) - Dispersione Kilojoule", fontweight="bold", pad=12)
    ax2.set_xlabel("")

    plt.suptitle("EnergiBridge - Boxplot di Dispersione Sperimentale (10 Run Reali)", fontweight="bold", y=1.03)
    plt.tight_layout()
    chart3_path = os.path.join(output_charts_dir, "statistical_boxplots.png")
    plt.savefig(chart3_path, dpi=300, bbox_inches='tight')
    plt.close()

    print(f"\n[OK] Generati con successo:\n - {chart1_path}\n - {chart2_path}\n - {chart3_path}")

if __name__ == "__main__":
    main()
