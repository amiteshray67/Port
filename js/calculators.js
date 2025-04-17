// calculators.js
// Financial calculator implementations for Amitesh Ray's portfolio website

// Chart.js initialization
let charts = {
    emiChart: null,
    npvChart: null,
    retirementChart: null
};

// ============ EMI CALCULATOR ============
function calculateEMI() {
    // Get values from inputs
    const loanAmount = parseFloat(document.getElementById('loan-amount').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value);
    const loanTenure = parseInt(document.getElementById('loan-tenure').value);

    // Validate inputs
    if (isNaN(loanAmount) || isNaN(interestRate) || isNaN(loanTenure) || 
        loanAmount <= 0 || interestRate <= 0 || loanTenure <= 0) {
        alert('Please enter valid values for all fields');
        return;
    }

    // Calculate EMI
    const monthlyInterestRate = interestRate / 12 / 100;
    const totalMonths = loanTenure * 12;
    const emi = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) / 
                (Math.pow(1 + monthlyInterestRate, totalMonths) - 1);
    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - loanAmount;

    // Update UI
    document.getElementById('emi-result').textContent = '₹ ' + emi.toFixed(0);
    document.getElementById('total-interest').textContent = '₹ ' + totalInterest.toFixed(0);

    // Update charts
    updateEMIChart(loanAmount, totalInterest);
    
    // Generate amortization schedule
    generateAmortizationSchedule(loanAmount, monthlyInterestRate, emi, totalMonths);
}

function updateEMIChart(principal, interest) {
    const ctx = document.getElementById('emi-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.emiChart) {
        charts.emiChart.destroy();
    }
    
    // Create new chart
    charts.emiChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#6366F1', '#F59E0B'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '70%'
        }
    });
}

function generateAmortizationSchedule(principal, monthlyInterestRate, emi, totalMonths) {
    const tableBody = document.getElementById('amortization-table-body');
    tableBody.innerHTML = '';

    let balance = principal;
    let totalInterestPaid = 0;
    const today = new Date();
    
    // Generate schedule for first 12 rows or complete table if less than 12 months
    const rowsToDisplay = Math.min(12, totalMonths);
    
    for (let i = 1; i <= rowsToDisplay; i++) {
        const interestPayment = balance * monthlyInterestRate;
        const principalPayment = emi - interestPayment;
        balance -= principalPayment;
        totalInterestPaid += interestPayment;
        
        // Calculate payment date
        const paymentDate = new Date(today);
        paymentDate.setMonth(today.getMonth() + i);
        
        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i}</td>
            <td>${paymentDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
            <td>₹ ${emi.toFixed(0)}</td>
            <td>₹ ${principalPayment.toFixed(0)}</td>
            <td>₹ ${interestPayment.toFixed(0)}</td>
            <td>₹ ${Math.max(0, balance).toFixed(0)}</td>
        `;
        tableBody.appendChild(row);
    }
    
    // If more than 12 months, add a message
    if (totalMonths > 12) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="6" class="text-center italic">... ${totalMonths - 12} more payments ...</td>`;
        tableBody.appendChild(row);
    }
}

// ============ NPV CALCULATOR ============
function calculateNPV() {
    // Get values from inputs
    const propertyPrice = parseFloat(document.getElementById('property-price').value);
    const monthlyRental = parseFloat(document.getElementById('monthly-rental').value);
    const rentalGrowth = parseFloat(document.getElementById('rental-growth').value);
    const maintenanceCost = parseFloat(document.getElementById('maintenance-cost').value);
    const investmentHorizon = parseInt(document.getElementById('investment-horizon').value);
    const discountRate = parseFloat(document.getElementById('discount-rate').value);
    const growthRate = parseFloat(document.getElementById('growth-rate').value);
    const sellProperty = document.getElementById('sell-property').checked;

    // Validate inputs
    if (isNaN(propertyPrice) || isNaN(monthlyRental) || isNaN(rentalGrowth) || 
        isNaN(maintenanceCost) || isNaN(investmentHorizon) || isNaN(discountRate) || 
        isNaN(growthRate) || propertyPrice <= 0 || monthlyRental < 0 || 
        investmentHorizon <= 0 || discountRate < 0) {
        alert('Please enter valid values for all fields');
        return;
    }

    // Calculate NPV
    let npv = -propertyPrice; // Initial investment is negative
    const annualDiscountRate = discountRate / 100;
    const annualRentalGrowth = rentalGrowth / 100;
    
    // Arrays for chart data
    const years = Array.from({length: investmentHorizon}, (_, i) => i + 1);
    const cashFlows = [];
    const presentValues = [];
    const cumulativeNPVs = [];
    
    let cumulativeNPV = -propertyPrice;
    
    // Calculate cash flows for each year
    const yearlyBreakdown = document.getElementById('npv-breakdown-body');
    yearlyBreakdown.innerHTML = '';
    
    for (let year = 1; year <= investmentHorizon; year++) {
        // Calculate rental income with growth
        const yearlyRental = monthlyRental * 12 * Math.pow(1 + annualRentalGrowth, year - 1);
        const yearlyMaintenance = maintenanceCost;
        const netCashFlow = yearlyRental - yearlyMaintenance;
        
        // Calculate present value
        const presentValue = netCashFlow / Math.pow(1 + annualDiscountRate, year);
        npv += presentValue;
        cumulativeNPV += presentValue;
        
        // Add to chart data
        cashFlows.push(netCashFlow);
        presentValues.push(presentValue);
        cumulativeNPVs.push(cumulativeNPV);
        
        // Add row to breakdown table
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${year}</td>
            <td>₹ ${yearlyRental.toFixed(0)}</td>
            <td>₹ ${yearlyMaintenance.toFixed(0)}</td>
            <td>₹ ${netCashFlow.toFixed(0)}</td>
            <td>₹ ${presentValue.toFixed(0)}</td>
            <td>₹ ${cumulativeNPV.toFixed(0)}</td>
        `;
        yearlyBreakdown.appendChild(row);
    }
    
    // Add property sale value at the end if selected
    let finalSaleValue = 0;
    if (sellProperty) {
        finalSaleValue = propertyPrice * Math.pow(1 + growthRate / 100, investmentHorizon);
        const presentValueOfSale = finalSaleValue / Math.pow(1 + annualDiscountRate, investmentHorizon);
        npv += presentValueOfSale;
        
        // Add sale row to breakdown table
        const saleRow = document.createElement('tr');
        saleRow.innerHTML = `
            <td>${investmentHorizon}</td>
            <td colspan="2">Property Sale</td>
            <td>₹ ${finalSaleValue.toFixed(0)}</td>
            <td>₹ ${presentValueOfSale.toFixed(0)}</td>
            <td>₹ ${(npv).toFixed(0)}</td>
        `;
        yearlyBreakdown.appendChild(saleRow);
    }
    
    // Update results
    document.getElementById('npv-result').textContent = '₹ ' + npv.toFixed(0);
    document.getElementById('sale-value').textContent = '₹ ' + finalSaleValue.toFixed(0);
    
    // Update investment viability message
    const viabilityElement = document.getElementById('investment-viability');
    if (npv > 0) {
        viabilityElement.textContent = 'This investment is viable (NPV > 0)';
        viabilityElement.classList.remove('text-red-500');
        viabilityElement.classList.add('text-green-500');
    } else {
        viabilityElement.textContent = 'This investment is not viable (NPV ≤ 0)';
        viabilityElement.classList.remove('text-green-500');
        viabilityElement.classList.add('text-red-500');
    }
    
    // Update chart
    updateNPVChart(years, cashFlows, presentValues, cumulativeNPVs);
}

function updateNPVChart(years, cashFlows, presentValues, cumulativeNPVs) {
    const ctx = document.getElementById('npv-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.npvChart) {
        charts.npvChart.destroy();
    }
    
    // Create new chart
    charts.npvChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Cash Flow',
                    data: cashFlows,
                    backgroundColor: '#6366F1',
                    borderColor: '#4F46E5',
                    borderWidth: 1
                },
                {
                    label: 'Present Value',
                    data: presentValues,
                    backgroundColor: '#F59E0B',
                    borderColor: '#D97706',
                    borderWidth: 1
                },
                {
                    label: 'Cumulative NPV',
                    data: cumulativeNPVs,
                    type: 'line',
                    fill: false,
                    borderColor: '#10B981',
                    tension: 0.1,
                    pointBackgroundColor: '#10B981'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount (₹)'
                    }
                }
            }
        }
    });
}

// ============ RETIREMENT CALCULATOR ============
function calculateRetirement() {
    // Get values from inputs
    const currentAge = parseInt(document.getElementById('current-age').value);
    const retirementAge = parseInt(document.getElementById('retirement-age').value);
    const lifeExpectancy = parseInt(document.getElementById('life-expectancy').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value);
    const inflationRate = parseFloat(document.getElementById('inflation-rate').value);
    const currentSavings = parseFloat(document.getElementById('current-savings').value);
    const monthlyContribution = parseFloat(document.getElementById('monthly-contribution').value);
    const returnRateBefore = parseFloat(document.getElementById('return-rate-before').value);
    const returnRateAfter = parseFloat(document.getElementById('return-rate-after').value);
    const sipStepUp = document.getElementById('sip-step-up').checked;
    const stepUpRate = sipStepUp ? parseFloat(document.getElementById('step-up-rate').value) : 0;

    // Validate inputs
    if (isNaN(currentAge) || isNaN(retirementAge) || isNaN(lifeExpectancy) || 
        isNaN(monthlyExpenses) || isNaN(inflationRate) || isNaN(currentSavings) || 
        isNaN(monthlyContribution) || isNaN(returnRateBefore) || isNaN(returnRateAfter) || 
        (sipStepUp && isNaN(stepUpRate)) || 
        currentAge < 0 || retirementAge <= currentAge || lifeExpectancy <= retirementAge || 
        monthlyExpenses < 0 || inflationRate < 0 || currentSavings < 0 || 
        monthlyContribution < 0 || returnRateBefore < 0 || returnRateAfter < 0 || 
        (sipStepUp && stepUpRate < 0)) {
        alert('Please enter valid values for all fields');
        return;
    }

    // Calculate retirement corpus needed
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    const annualInflationRate = inflationRate / 100;
    const annualReturnRateBefore = returnRateBefore / 100;
    const annualReturnRateAfter = returnRateAfter / 100;
    
    // Monthly expenses at retirement (accounting for inflation)
    const monthlyExpensesAtRetirement = monthlyExpenses * 
                                       Math.pow(1 + annualInflationRate, yearsToRetirement);
    const annualExpensesAtRetirement = monthlyExpensesAtRetirement * 12;
    
    // Calculate corpus needed at retirement
    let corpusNeeded = 0;
    for (let year = 1; year <= yearsInRetirement; year++) {
        const expenseInYear = annualExpensesAtRetirement * 
                             Math.pow(1 + annualInflationRate, year);
        corpusNeeded += expenseInYear / Math.pow(1 + annualReturnRateAfter, year);
    }
    
    // Calculate expected corpus at retirement
    let expectedCorpus = currentSavings * Math.pow(1 + annualReturnRateBefore, yearsToRetirement);
    let currentYearContribution = monthlyContribution * 12;
    
    for (let year = 1; year <= yearsToRetirement; year++) {
        // If SIP step-up is enabled, increase yearly contribution
        if (sipStepUp && year > 1) {
            currentYearContribution *= (1 + stepUpRate / 100);
        }
        
        expectedCorpus += currentYearContribution * 
                         Math.pow(1 + annualReturnRateBefore, yearsToRetirement - year);
    }
    
    // Calculate monthly shortfall or surplus
    const shortfall = corpusNeeded - expectedCorpus;
    let additionalMonthlyContribution = 0;
    if (shortfall > 0) {
        // Calculate additional monthly contribution needed
        let futureValueFactor = 0;
        for (let year = 1; year <= yearsToRetirement; year++) {
            futureValueFactor += Math.pow(1 + annualReturnRateBefore, year);
        }
        additionalMonthlyContribution = shortfall / (futureValueFactor * 12);
    }
    
    // Update UI
    document.getElementById('corpus-required').textContent = '₹ ' + (corpusNeeded / 10000000).toFixed(2) + ' Cr';
    document.getElementById('expected-corpus').textContent = '₹ ' + (expectedCorpus / 10000000).toFixed(2) + ' Cr';
    
    const shortfallElement = document.getElementById('monthly-shortfall');
    if (shortfall > 0) {
        shortfallElement.textContent = '₹ ' + additionalMonthlyContribution.toFixed(0);
        shortfallElement.classList.remove('text-green-500');
        shortfallElement.classList.add('text-red-500');
    } else {
        shortfallElement.textContent = '₹ ' + Math.abs(additionalMonthlyContribution).toFixed(0) + ' surplus';
        shortfallElement.classList.remove('text-red-500');
        shortfallElement.classList.add('text-green-500');
    }
    
    // Prepare chart data
    updateRetirementChart(
        currentAge, 
        retirementAge, 
        lifeExpectancy, 
        currentSavings, 
        expectedCorpus, 
        corpusNeeded, 
        monthlyContribution,
        stepUpRate,
        sipStepUp
    );
    
    // Update allocation suggestions based on age
    updateAllocationSuggestion(currentAge);
}

function updateAllocationSuggestion(age) {
    let equityPercentage, debtPercentage, alternativesPercentage;
    
    // Simple age-based allocation strategy (this can be customized further)
    if (age < 30) {
        equityPercentage = 80;
        debtPercentage = 15;
        alternativesPercentage = 5;
    } else if (age < 40) {
        equityPercentage = 70;
        debtPercentage = 25;
        alternativesPercentage = 5;
    } else if (age < 50) {
        equityPercentage = 60;
        debtPercentage = 30;
        alternativesPercentage = 10;
    } else if (age < 60) {
        equityPercentage = 50;
        debtPercentage = 40;
        alternativesPercentage = 10;
    } else {
        equityPercentage = 30;
        debtPercentage = 60;
        alternativesPercentage = 10;
    }
    
    // Update the allocation chart
    const allocationCtx = document.getElementById('allocation-chart').getContext('2d');
    new Chart(allocationCtx, {
        type: 'doughnut',
        data: {
            labels: ['Equity', 'Debt', 'Alternatives'],
            datasets: [{
                data: [equityPercentage, debtPercentage, alternativesPercentage],
                backgroundColor: ['#6366F1', '#F59E0B', '#10B981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '70%'
        }
    });
}

function updateRetirementChart(
    currentAge, 
    retirementAge, 
    lifeExpectancy, 
    currentSavings, 
    expectedCorpus, 
    corpusNeeded, 
    monthlyContribution,
    stepUpRate,
    sipStepUp
) {
    const ctx = document.getElementById('retirement-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts.retirementChart) {
        charts.retirementChart.destroy();
    }
    
    // Prepare data for corpus growth projection
    const labels = [];
    const corpusData = [];
    
    let corpus = currentSavings;
    let yearlyContribution = monthlyContribution * 12;
    
    for (let age = currentAge; age <= lifeExpectancy; age++) {
        labels.push(age);
        
        // Before retirement
        if (age < retirementAge) {
            // Add yearly contribution
            corpus += yearlyContribution;
            
            // Apply growth
            corpus *= (1 + (document.getElementById('return-rate-before').value / 100));
            
            // Apply SIP step-up for next year if enabled
            if (sipStepUp && age < retirementAge - 1) {
                yearlyContribution *= (1 + stepUpRate / 100);
            }
        } 
        // After retirement
        else {
            // Withdraw yearly expenses (increasing with inflation)
            const yearsIntoRetirement = age - retirementAge;
            const inflationRate = document.getElementById('inflation-rate').value / 100;
            const monthlyExpensesAtRetirement = document.getElementById('monthly-expenses').value * 
                                               Math.pow(1 + inflationRate, retirementAge - currentAge);
            const annualExpensesAtAge = monthlyExpensesAtRetirement * 12 * 
                                       Math.pow(1 + inflationRate, yearsIntoRetirement);
            
            corpus -= annualExpensesAtAge;
            
            // Apply growth to remaining corpus
            if (corpus > 0) {
                corpus *= (1 + (document.getElementById('return-rate-after').value / 100));
            }
        }
        
        // Add data point (ensure corpus doesn't go negative for chart)
        corpusData.push(Math.max(0, corpus));
    }
    
    // Create vertical line dataset at retirement age
    const retirementIndex = labels.indexOf(retirementAge);
    const verticalLineData = Array(labels.length).fill(null);
    if (retirementIndex !== -1) {
        verticalLineData[retirementIndex] = 0;
        verticalLineData[retirementIndex + 1] = Math.max(...corpusData) * 1.1;
    }
    
    // Create new chart
    charts.retirementChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Projected Corpus',
                    data: corpusData,
                    borderColor: '#6366F1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'Retirement Age',
                    data: verticalLineData,
                    borderColor: '#DC2626',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Age'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Corpus (₹)'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 10000000) {
                                return '₹ ' + (value / 10000000).toFixed(1) + ' Cr';
                            } else if (value >= 100000) {
                                return '₹ ' + (value / 100000).toFixed(1) + ' L';
                            } else {
                                return '₹ ' + value;
                            }
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let value = context.raw;
                            if (value >= 10000000) {
                                return 'Corpus: ₹ ' + (value / 10000000).toFixed(2) + ' Cr';
                            } else if (value >= 100000) {
                                return 'Corpus: ₹ ' + (value / 100000).toFixed(2) + ' L';
                            } else {
                                return 'Corpus: ₹ ' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        }
    });
}

// Event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all calculators with default values
    calculateEMI();
    calculateNPV();
    calculateRetirement();
    
    // Add event listeners
    document.getElementById('calculate-emi').addEventListener('click', calculateEMI);
    document.getElementById('calculate-npv').addEventListener('click', calculateNPV);
    document.getElementById('calculate-retirement').addEventListener('click', calculateRetirement);
    
    // Toggle SIP step-up field visibility
    document.getElementById('sip-step-up').addEventListener('change', function() {
        const stepUpRateContainer = document.getElementById('step-up-rate-container');
        stepUpRateContainer.style.display = this.checked ? 'block' : 'none';
    });
});
