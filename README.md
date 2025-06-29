# CMOS Cosmic Ray Detector with Processing and p5.js

This is an experimental tool for detecting **cosmic ray hits** using the CMOS sensors found in **phone and computer webcams**. The system is designed for use in both art and science projects.

It uses:

- **p5.js** (JavaScript) for browser-based experiments
- **Processing 4** (Java) for more advanced desktop visualization and hardware integration

The CMOS sensor captures light, but when covered completely (usually with **tinfoil** or other shielding), it can occasionally register hits from **cosmic particles**, most notably **muons**.

## 📷 What It Does

- Reads raw `pixels[]` data from a webcam
- Identifies sudden brightness spikes that may represent particle interactions
- Visualizes those hits using a variety of generative techniques
- Can also send signals to an **Arduino** or other hardware via serial to **trigger kinetic sculptures**

## 📼 Background and Inspiration

This idea builds on several previous projects and experiments:

- YouTube video demonstrating webcam particle detection:  
  [Watch on YouTube](https://youtu.be/06qlhZqn-KY?si=urwp4dkLzZclbiFj)
- Software used in those videos: **Theremino ParticleDetector v1.0**
- More detailed explanation and data collection setup from PhysicsOpenLab:  
  https://physicsopenlab.org/2016/05/22/misure-con-webcam-particle-detector/

Unlike those, this project focuses on **custom implementations** using **Processing** and **p5.js**, which offer full creative and experimental control.

## 🌌 Why Muons?

According to [Wikipedia](https://en.wikipedia.org/wiki/Cosmic_ray):

> About **10,000 muons** reach every **square meter** of Earth’s surface every **minute**. These charged particles form as by-products of cosmic rays colliding with molecules in the upper atmosphere. Traveling at relativistic speeds, muons can penetrate tens of meters into rock and other matter before attenuating due to absorption or scattering.

### 📏 Basic Muon Flux Math

- **1 m² = 10,000 cm²**
- So:  
  **10,000 muons/m²/minute = 1 muon/cm²/minute**

### 📦 Example: Small CMOS Sensor

If your CMOS sensor has an area of **0.5 cm²**, you can expect:

- **~1 muon every 2 minutes**
- Or **~30 muons per hour**

However, hits may be random — they follow a Poisson distribution. Some hits may also be **sensor noise**, **gamma rays**, or **stray electrons**.

## 🔬 Future Plans

- **Calibrate** using a known radiation source
- Test system inside an **X-ray machine** (e.g. in the Beijing subway) to measure sensitivity and tune thresholds
- Compare different sensors (mobile, webcam, etc.)
- Explore using this system in **mobile or field-based art installations**
- Document and archive particle "hits" as **drawings or kinetic actions**

[Reference article on webcam-based detection (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0969806X1831435X)

---

## ☢️ Am-241 Ion Chamber Test

This test explores the responsiveness of a hacked webcam CMOS sensor to ionizing radiation.

### 🔬 Background

**Americium-241 (Am-241)** is a synthetic radioactive isotope commonly used in **smoke detectors**. It emits **alpha particles** and low-energy **gamma rays**, and is housed in a sealed **ionization chamber** that generates a small, stable current by ionizing air molecules. When smoke interrupts this current, the alarm is triggered.

### 🧪 Experiment

- A **hacked webcam** with its **lens removed** and **CMOS sensor exposed** is placed inside a **lightproof box**.
- In the **first test**, the box is sealed **without any radioactive source**. Fewer than **1 hit per minute** is observed — likely from **cosmic rays**.
- In the **second test**, a **>0.08 μCi Am-241 ion chamber** (typically used in smoke alarms) is placed next to the CMOS chip.
- This results in **hundreds of hits per minute**, showing clear evidence that the sensor is reacting to **ionizing radiation** from the Am-241.

### 🧠 Interpretation

The experiment demonstrates that the webcam CMOS chip, especially when exposed and monitored via Processing or p5.js, can function as a **radiation detector**. The dramatic difference in hit rate between the control and Am-241 conditions supports this conclusion.

## 🧪 Disclaimer

This project is **experimental** and for **educational and artistic purposes** only. It does not provide certified measurements of radiation and is **not a safety tool**. If using actual radioactive sources, **follow all local laws and safety procedures**.

---
