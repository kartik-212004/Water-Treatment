interface ContaminantData {
  name: string;
  healthRisk: string;
  yourWater: number;
  healthGuideline: number;
  legalLimit: number;
  removalRate: string;
  unit: string;
}

interface ReportData {
  zipCode: string;
  contaminantsFound: number;
  contaminants: ContaminantData[];
}

export const mockReportData: ReportData = {
  zipCode: "90210",
  contaminantsFound: 6,
  contaminants: [
    {
      name: "Arsenic",
      healthRisk: "Linked to cancer, heart disease, and developmental issues",
      yourWater: 8.2,
      healthGuideline: 3.0,
      legalLimit: 10.0,
      removalRate: "99.9%",
      unit: "ppb",
    },
    {
      name: "Lead",
      healthRisk: "Causes brain damage, especially in children",
      yourWater: 12.5,
      healthGuideline: 0,
      legalLimit: 15.0,
      removalRate: "99.5%",
      unit: "ppb",
    },
    {
      name: "Chlorine",
      healthRisk: "May increase cancer risk and cause respiratory issues",
      yourWater: 2.8,
      healthGuideline: 1.0,
      legalLimit: 4.0,
      removalRate: "99.9%",
      unit: "ppm",
    },
    {
      name: "Fluoride",
      healthRisk: "High levels linked to dental and skeletal fluorosis",
      yourWater: 3.2,
      healthGuideline: 2.0,
      legalLimit: 4.0,
      removalRate: "95.8%",
      unit: "ppm",
    },
    {
      name: "Nitrates",
      healthRisk: "Dangerous for infants, may cause blue baby syndrome",
      yourWater: 8.1,
      healthGuideline: 5.0,
      legalLimit: 10.0,
      removalRate: "92.3%",
      unit: "ppm",
    },
    {
      name: "PFAS (Forever Chemicals)",
      healthRisk: "Linked to cancer, liver damage, and immune system effects",
      yourWater: 45.0,
      healthGuideline: 4.0,
      legalLimit: 70.0,
      removalRate: "99.7%",
      unit: "ppt",
    },
  ],
};
