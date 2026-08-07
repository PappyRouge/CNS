async function loadCNS() {
  const res = await fetch('/cns/v1/state/summary');
  const data = await res.json();

  document.getElementById("personalStats").textContent =
    `Stable: ${data.personal.stable}, 
     Strained: ${data.personal.strained}, 
     Depleted: ${data.personal.depleted}`;

  document.getElementById("communityStats").innerHTML =
    data.communities.map(c => `
      <div>${c.city}: ${c.status} (Priority: ${c.priority})</div>
    `).join("");

  document.getElementById("regionStats").innerHTML =
    data.regions.map(r => `
      <div>${r.region}: Stress ${r.stressScore} (Alert: ${r.alert})</div>
    `).join("");

  document.getElementById("globalStress").textContent =
    data.global.overallStress;

  document.getElementById("recommendedAction").textContent =
    data.global.recommendedAction;
}

loadCNS();
setInterval(loadCNS, 30000);
