// Goal Based Planner JS
// Handles dynamic goal input, calculation, and chart rendering

document.addEventListener('DOMContentLoaded', function() {
    const goalInputsContainer = document.getElementById('goal-inputs-container');
    const addGoalBtn = document.getElementById('add-goal-btn');
    const form = document.getElementById('goal-planner-form');
    const resultsSection = document.getElementById('goal-planner-results');
    const summaryDiv = document.getElementById('goal-planner-summary');
    let goalCount = 0;
    let goalPlannerChart = null;

    function createGoalInput(idx) {
        const div = document.createElement('div');
        div.className = 'goal-input-row';
        div.innerHTML = `
            <label>Goal Name<br><input type="text" name="goal-name-${idx}" placeholder="e.g. Buy a Car" required></label>
            <label>Target Amount<br><input type="number" name="goal-amount-${idx}" min="0" placeholder="e.g. 500000" required></label>
            <label>Years to Goal<br><input type="number" name="goal-years-${idx}" min="1" max="100" placeholder="e.g. 5" required></label>
            <label>Inflation Rate (%)<br><input type="number" name="goal-inflation-${idx}" min="0" max="20" value="6" required></label>
            <label>Expected Return (%)<br><input type="number" name="goal-return-${idx}" min="0" value="12" required></label>
            <button type="button" class="remove-goal-btn" title="Remove Goal"><i class="fas fa-trash"></i></button>
        `;
        div.querySelector('.remove-goal-btn').onclick = function() {
            div.remove();
        };
        return div;
    }

    function addGoalInput() {
        goalCount++;
        goalInputsContainer.appendChild(createGoalInput(goalCount));
    }

    addGoalBtn.addEventListener('click', addGoalInput);
    addGoalInput(); // Add first goal input by default

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const goals = [];
        const rows = goalInputsContainer.querySelectorAll('.goal-input-row');
        for (const row of rows) {
            const name = row.querySelector('input[name^="goal-name"]').value;
            const amount = parseFloat(row.querySelector('input[name^="goal-amount"]').value);
            const years = parseInt(row.querySelector('input[name^="goal-years"]').value);
            const inflation = parseFloat(row.querySelector('input[name^="goal-inflation"]').value);
            const returns = parseFloat(row.querySelector('input[name^="goal-return"]').value);
            if (name && amount && years && !isNaN(inflation) && !isNaN(returns)) {
                goals.push({ name, amount, years, inflation, returns });
            }
        }
        if (goals.length === 0) {
            alert('Please enter at least one valid goal.');
            return;
        }
        // Calculate required SIP for each goal
        const results = goals.map(goal => {
            // Inflate goal amount
            const inflatedAmount = goal.amount * Math.pow(1 + goal.inflation / 100, goal.years);
            // SIP formula: FV = SIP * [(1+r)^n - 1]/r
            const n = goal.years * 12;
            const r = goal.returns / 100 / 12;
            const sip = inflatedAmount * r / (Math.pow(1 + r, n) - 1);
            return { ...goal, inflatedAmount, sip };
        });
        // Show results
        resultsSection.style.display = 'block';
        summaryDiv.innerHTML = '<h4 class="font-semibold mb-2" style="color:var(--primary-color)">Results:</h4>' + results.map(r => `<div class="mb-2 p-2 rounded" style="background:rgba(55,65,81,0.94);color:var(--text-color);border-radius:10px;border:1.5px solid rgba(255,255,255,0.09);box-shadow:0 4px 18px var(--shadow-color);font-size:1.08rem;animation:floatCard 1s cubic-bezier(.22,1,.36,1) both;"><b>${r.name}</b>: Target in ${r.years} years = <span style="color:var(--primary-color)">₹${r.inflatedAmount.toLocaleString(undefined, {maximumFractionDigits:0})}</span>, Required SIP: <b style="color:var(--primary-color)">₹${r.sip.toLocaleString(undefined, {maximumFractionDigits:0})}/month</b></div>`).join('');
        // Chart
        const ctx = document.getElementById('goal-planner-chart').getContext('2d');
        if (goalPlannerChart) goalPlannerChart.destroy();
        goalPlannerChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: results.map(r => r.name),
                datasets: [{
                    label: 'Required SIP (₹/month)',
                    data: results.map(r => Math.round(r.sip)),
                    backgroundColor: '#6366F1',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: '₹/month' }
                    }
                }
            }
        });
    });
});
