function calculateInterest() {
  let principalRaw = document.getElementById("principal").value.replace(/[^0-9.]/g, '');
  let contributionRaw = document.getElementById("contribution").value.replace(/[^0-9.]/g, '');
  let rateRaw = document.getElementById("rate").value.replace(/[^0-9.]/g, '');
  let years = parseFloat(document.getElementById("years").value);
  let compounds = parseInt(document.getElementById("compounds").value);
  let depositFrequency = parseInt(document.getElementById("contributionFrequency").value);

  let principal = parseFloat(principalRaw) || 0;
  let contribution = parseFloat(contributionRaw) || 0;
  let rate = parseFloat(rateRaw) / 100 || 0; // Convert percentage to decimal

  if (isNaN(principal) || isNaN(contribution) || isNaN(rate) || isNaN(years)) {
    alert("Please enter valid numbers.");
    return;
  }

  let n = compounds; // compounding frequency per year
  let f = depositFrequency; // deposits per year
  let t = years;
  let r = rate;

  // Calculate final amount for the starting investment
  let finalAmount = principal * Math.pow((1 + r / n), (n * t));

  // Add compounded contributions over time
  for (let i = 1; i <= t * f; i++) {
    let yearsRemaining = (t * f - i) / f;
    finalAmount += contribution * Math.pow((1 + r / n), yearsRemaining * n);
  }

  // Prepare arrays for the graph and table
  let investmentValues = [];
  let depositValues = [];
  let yearsArray = [];
  let totalDeposits = principal;

  for (let i = 0; i <= t; i++) {
    let tempAmount = principal * Math.pow((1 + r / n), (n * i));
    
    for (let j = 1; j <= i * f; j++) {
      let yearsRemaining = (i * f - j) / f;
      tempAmount += contribution * Math.pow((1 + r / n), yearsRemaining * n);
    }

    totalDeposits = principal + contribution * f * i;

    investmentValues.push(tempAmount);
    depositValues.push(totalDeposits);
    yearsArray.push(i.toString());
  }

  // Calculate overall gain (not displayed)
  let gain = finalAmount - totalDeposits;
  let formattedAmount = finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // let formattedGain = gain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  document.getElementById("result").innerHTML = 
    `In ${years} years, your investment will be worth: $${formattedAmount}`;

  // Populate the growth table
  let tableBody = document.getElementById("growthTable").getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";
  for (let i = 0; i < yearsArray.length; i++) {
    let interestEarned = investmentValues[i] - depositValues[i];
    let row = `<tr>
      <td>${yearsArray[i]}</td>
      <td>$${depositValues[i].toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}</td>
      <td>$${interestEarned.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}</td>
      <td>$${investmentValues[i].toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}</td>
    </tr>`;
    tableBody.innerHTML += row;
  }

  document.getElementById("resultsContainer").style.display = "block";
  drawChart(yearsArray, investmentValues, depositValues);
}

function drawChart(labels, investmentData, depositData) {
  let chartContainer = document.querySelector(".chart-container");
  chartContainer.style.display = "block";

  let ctx = document.getElementById("investmentChart").getContext("2d");

  if (window.myChart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Total investment value ($)',
          data: investmentData,
          borderColor: '#27372d',
          backgroundColor: 'rgba(39,55,45,0.2)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3
        },
        {
          label: 'Total deposits ($)',
          data: depositData,
          borderColor: '#68916a',
          backgroundColor: 'rgba(104,145,106,0.2)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 2.5,
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          mode: 'index',
          intersect: false,
          bodyFont: { size: 10 },
          titleFont: { size: 10 },
          callbacks: {
            title: function (tooltipItems) {
              return `Year ${tooltipItems[0].label}`;
            },
            label: function (tooltipItem) {
              if (tooltipItem.datasetIndex !== 0) return null;
              let investment = tooltipItem.dataset.data[tooltipItem.dataIndex];
              let deposits = depositData[tooltipItem.dataIndex];
              return [
                `Investment total: $${investment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `Deposit total: $${deposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              ];
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Years' } },
        y: { title: { display: true, text: 'Investment value ($)' } }
      }
    }
  });
}

function formatCurrency(input) {
  let value = input.value.replace(/[^0-9.]/g, '');
  input.value = value ? "$" + parseFloat(value).toLocaleString() : "$0";
}

function formatPercentage(input) {
  let value = input.value.replace(/[^0-9.]/g, '');
  input.value = value ? value + "%" : "0%";
}

function removePercentage(input) {
  input.value = input.value.replace(/[%]/g, '');
}

function resetCalculator() {
  // Clear all input values
  document.getElementById("principal").value = "";
  document.getElementById("contribution").value = "";
  document.getElementById("rate").value = "";
  document.getElementById("years").value = "";
  document.getElementById("contributionFrequency").selectedIndex = 0;
  document.getElementById("compounds").selectedIndex = 0;
  // Hide the results container
  document.getElementById("resultsContainer").style.display = "none";
  // Scroll back to the top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Accordion functionality for the growth table
document.addEventListener("DOMContentLoaded", function() {
  var acc = document.getElementsByClassName("accordion");
  for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }
});
