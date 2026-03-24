// ============================================================
// models/plantCareModel.js - Plant Disease & Care Information
// Using an in-memory JSON store (easy to replace with DB later)
// ============================================================

// ── Plant care database ──────────────────────────────────────
// Each key is a normalized disease/plant name
const plantCareData = {

  "healthy": {
    name: "Healthy Plant",
    causes: ["No disease detected"],
    prevention: [
      "Maintain regular watering schedule",
      "Ensure adequate sunlight",
      "Use balanced fertilizer",
      "Monitor for pests regularly",
    ],
    treatment: ["No treatment needed. Keep up the good care!"],
    severity: "none",
  },

  "early_blight": {
    name: "Early Blight (Alternaria solani)",
    causes: [
      "Fungal infection by Alternaria solani",
      "High humidity and warm temperatures",
      "Infected plant debris in soil",
      "Overcrowded plants with poor air circulation",
    ],
    prevention: [
      "Rotate crops every 2-3 years",
      "Remove and destroy infected leaves immediately",
      "Avoid overhead watering – water at base",
      "Maintain proper plant spacing for airflow",
      "Use disease-resistant tomato/potato varieties",
    ],
    treatment: [
      "Apply fungicides containing chlorothalonil or mancozeb",
      "Remove all infected lower leaves",
      "Spray with neem oil solution (5ml/L water) weekly",
      "Apply copper-based fungicide every 7-10 days",
    ],
    severity: "moderate",
  },

  "late_blight": {
    name: "Late Blight (Phytophthora infestans)",
    causes: [
      "Water mold Phytophthora infestans",
      "Cool, wet weather conditions",
      "Infected seed tubers or transplants",
      "Waterlogged soil",
    ],
    prevention: [
      "Use certified disease-free seeds/tubers",
      "Avoid watering in the evening",
      "Apply preventive copper fungicides before rainy season",
      "Destroy all crop residues after harvest",
      "Plant in well-drained soil",
    ],
    treatment: [
      "Apply systemic fungicides (metalaxyl + mancozeb)",
      "Remove and burn infected plant material",
      "Spray Bordeaux mixture (1%) every 7 days",
      "Ensure field drainage to remove excess water",
    ],
    severity: "severe",
  },

  "powdery_mildew": {
    name: "Powdery Mildew",
    causes: [
      "Fungal infection (Erysiphe spp.)",
      "Dry weather with high humidity",
      "High nitrogen levels in soil",
      "Shaded growing conditions",
    ],
    prevention: [
      "Plant in sunny locations with good airflow",
      "Avoid excessive nitrogen fertilization",
      "Use mildew-resistant varieties",
      "Prune dense foliage to improve air circulation",
    ],
    treatment: [
      "Spray with diluted neem oil (2 tbsp per gallon)",
      "Apply potassium bicarbonate spray",
      "Use sulfur-based fungicide",
      "Remove heavily infected leaves",
      "Spray baking soda solution (1 tsp per quart of water)",
    ],
    severity: "moderate",
  },

  "leaf_spot": {
    name: "Leaf Spot Disease",
    causes: [
      "Fungal or bacterial infection",
      "Splashing water spreading spores",
      "Warm, humid conditions",
      "Wounds or insect damage on leaves",
    ],
    prevention: [
      "Avoid wetting foliage when watering",
      "Apply mulch to prevent soil splash",
      "Remove infected leaves promptly",
      "Disinfect pruning tools between plants",
    ],
    treatment: [
      "Apply copper-based fungicide/bactericide",
      "Remove and dispose of affected leaves",
      "Improve drainage to reduce moisture",
      "Spray chlorothalonil fungicide every 7-14 days",
    ],
    severity: "mild",
  },

  "bacterial_blight": {
    name: "Bacterial Blight",
    causes: [
      "Bacterial infection (Xanthomonas spp.)",
      "Spread through rain, irrigation, and insects",
      "Warm, humid conditions",
      "Contaminated tools and equipment",
    ],
    prevention: [
      "Use disease-free certified seeds",
      "Avoid working in field when plants are wet",
      "Sanitize all farming tools regularly",
      "Rotate crops annually",
    ],
    treatment: [
      "Apply copper bactericide spray",
      "Remove and destroy infected plant material",
      "Avoid overhead irrigation",
      "Apply streptomycin-based bactericide if severe",
    ],
    severity: "severe",
  },

  "rust": {
    name: "Rust Disease",
    causes: [
      "Fungal infection (Puccinia spp.)",
      "High humidity and moderate temperatures",
      "Wind spreading spores from infected plants",
    ],
    prevention: [
      "Plant resistant varieties",
      "Ensure proper plant spacing",
      "Remove alternate host plants nearby",
      "Apply preventive fungicide in humid seasons",
    ],
    treatment: [
      "Apply triazole fungicides (propiconazole)",
      "Remove and destroy infected leaves",
      "Spray sulfur-based fungicide every 7-14 days",
      "Avoid watering in the evening",
    ],
    severity: "moderate",
  },

  "mosaic_virus": {
    name: "Mosaic Virus",
    causes: [
      "Viral infection spread by aphids",
      "Contaminated tools or hands",
      "Infected planting material",
      "Weed hosts carrying the virus",
    ],
    prevention: [
      "Control aphid populations with insecticides",
      "Use virus-free certified planting material",
      "Remove and destroy infected plants immediately",
      "Control weeds that harbor the virus",
      "Use reflective mulches to repel aphids",
    ],
    treatment: [
      "No cure exists – remove infected plants immediately",
      "Control aphid vectors with neem oil or insecticidal soap",
      "Disinfect hands and tools after handling infected plants",
      "Apply mineral oil to prevent aphid feeding",
    ],
    severity: "severe",
  },
};

const PlantCare = {

  // Get care info by disease name
  getByDisease: (diseaseName) => {
    // Normalize: lowercase, replace spaces with underscore
    const key = diseaseName.toLowerCase().replace(/\s+/g, '_');

    // Try exact match first, then partial match
    if (plantCareData[key]) return plantCareData[key];

    // Partial match search
    for (const k in plantCareData) {
      if (k.includes(key) || key.includes(k)) {
        return plantCareData[k];
      }
    }

    return null; // Not found
  },

  // Get all available disease names
  getAllDiseases: () => Object.keys(plantCareData),
};

module.exports = PlantCare;
