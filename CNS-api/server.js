import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// CNS memory (in‑RAM for v1)
const CNS = {
  persons: {},
  communities: {},
  regions: {}
};

// PERSON SIGNAL
app.post("/cns/v1/signal/person", (req, res) => {
  const { id, stability, energyDebt, burnoutRisk } = req.body;
  CNS.persons[id] = { stability, energyDebt, burnoutRisk };
  res.json({ status: "ok", received: true });
});

// COMMUNITY SIGNAL
app.post("/cns/v1/signal/community", (req, res) => {
  const { city, status, shortages, volunteerGap } = req.body;
  CNS.communities[city] = { status, shortages, volunteerGap };
  res.json({ status: "ok", received: true });
});

// REGION SIGNAL
app.post("/cns/v1/signal/region", (req, res) => {
  const { region, stressScore, criticalCommunities } = req.body;
  CNS.regions[region] = { stressScore, criticalCommunities };
  res.json({ status: "ok", received: true });
});

// SUMMARY
app.get("/cns/v1/state/summary", (req, res) => {
  const personal = {
    stable: Object.values(CNS.persons).filter(p => p.stability === "Stable").length,
    strained: Object.values(CNS.persons).filter(p => p.stability === "Strained").length,
    depleted: Object.values(CNS.persons).filter(p => p.stability === "Depleted").length
  };

  const communities = Object.entries(CNS.communities).map(([city, data]) => ({
    city,
    status: data.status,
    priority: data.status === "Critical" ? "high" :
              data.status === "Strained" ? "medium" : "low"
  }));

  const regions = Object.entries(CNS.regions).map(([region, data]) => ({
    region,
    stressScore: data.stressScore,
    alert: data.stressScore > 0.7 ? "severe" :
           data.stressScore > 0.4 ? "elevated" : "none"
  }));

  const globalStress = regions.reduce((acc, r) => acc + r.stressScore, 0) / (regions.length || 1);

  const recommendedAction =
    globalStress > 0.7 ? "Reduce contribution; region overloaded." :
    globalStress > 0.4 ? "Contribute only if stable." :
                         "Safe window for contribution.";

  res.json({
    personal,
    communities,
    regions,
    global: {
      overallStress: globalStress,
      recommendedAction
    }
  });
});

// PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CNS API running on ${PORT}`));
