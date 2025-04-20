document.addEventListener('DOMContentLoaded', function() {
    // Tools Tabs
    const toolsTabs = document.querySelectorAll('.tools-tab');
    const toolContents = document.querySelectorAll('.tool-content');
    
    toolsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Update active tab
            toolsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            toolContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-calculator`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Goal Based Planner Tab Logic
    const goalPlannerTab = document.querySelector('.tools-tab[data-tab="goal-planner"]');
    const goalPlannerContent = document.getElementById('goal-planner-calculator');
    if (goalPlannerTab && goalPlannerContent) {
        goalPlannerTab.addEventListener('click', function() {
            toolContents.forEach(content => content.classList.remove('active'));
            toolsTabs.forEach(t => t.classList.remove('active'));
            goalPlannerContent.classList.add('active');
            goalPlannerTab.classList.add('active');
        });
    }
    
    // EMI Calculator
    function calculateEMI() {
        const loanAmount = parseFloat(document.getElementById('emi-loan-amount').value);
        const interestRate = parseFloat(document.getElementById('emi-interest-rate').value) / 100 / 12; // Monthly rate
        const loanTenure = parseFloat(document.getElementById('emi-loan-tenure').value) * 12; // In months
        
        const emi = loanAmount * interestRate * Math.pow(1 + interestRate, loanTenure) / (Math.pow(1 + interestRate, loanTenure) - 1);
        const totalPayment = emi * loanTenure;
        const totalInterest = totalPayment - loanAmount;
        
        document.getElementById('emi-monthly-payment').textContent = `₹ ${emi.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        document.getElementById('emi-total-interest').textContent = `₹ ${totalInterest.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        document.getElementById('emi-total-payment').textContent = `₹ ${totalPayment.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        
        // Update Amortization Schedule
        updateEMISchedule(loanAmount, interestRate, emi, loanTenure);
        
        // Update Chart
        updateEMIChart(loanAmount, totalInterest);
    }
    
    function updateEMISchedule(loanAmount, interestRate, emi, loanTenure) {
        const scheduleTable = document.getElementById('emi-schedule').getElementsByTagName('tbody')[0];
        scheduleTable.innerHTML = '';
        
        let balance = loanAmount;
        const today = new Date();
        
        for (let i = 1; i <= Math.min(loanTenure, 240); i++) { // Limit to 240 rows (20 years)
            const paymentDate = new Date(today);
            paymentDate.setMonth(today.getMonth() + i);
            
            const interest = balance * interestRate;
            const principal = emi - interest;
            balance -= principal;
            
            const row = scheduleTable.insertRow();
            
            row.insertCell(0).textContent = i;
            row.insertCell(1).textContent = paymentDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
            row.insertCell(2).textContent = `₹ ${emi.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            row.insertCell(3).textContent = `₹ ${principal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            row.insertCell(4).textContent = `₹ ${interest.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            row.insertCell(5).textContent = `₹ ${Math.max(0, balance).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        }
    }
    
    function updateEMIChart(principal, interest) {
        const ctx = document.getElementById('emi-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (window.emiChart) {
            window.emiChart.destroy();
        }
        
        window.emiChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [principal, interest],
                    backgroundColor: [
                        getComputedStyle(document.body).getPropertyValue('--primary-color'),
                        getComputedStyle(document.body).getPropertyValue('--secondary-color')
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color')
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let value = context.raw;
                                return `₹ ${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // NPV Calculator
    function calculateNPV() {
        const propertyPrice = parseFloat(document.getElementById('npv-property-price').value);
        const monthlyRental = parseFloat(document.getElementById('npv-monthly-rental').value);
        const rentalGrowthRate = parseFloat(document.getElementById('npv-rental-growth').value) / 100;
        const maintenanceCost = parseFloat(document.getElementById('npv-maintenance-cost').value);
        const investmentHorizon = parseFloat(document.getElementById('npv-investment-horizon').value);
        const discountRate = parseFloat(document.getElementById('npv-discount-rate').value) / 100;
        const propertyGrowthRate = parseFloat(document.getElementById('npv-property-growth').value) / 100;
        const sellProperty = document.getElementById('npv-sell-property').checked;
        
        let npv = -propertyPrice; // Initial investment (negative)
        let yearlyData = [];
        
        for (let year = 1; year <= investmentHorizon; year++) {
            // Calculate adjusted rental income with growth
            const annualRental = monthlyRental * 12 * Math.pow(1 + rentalGrowthRate, year - 1);
            const expenses = maintenanceCost * Math.pow(1 + rentalGrowthRate/2, year - 1); // Maintenance grows half as fast as rental
            const netCashFlow = annualRental - expenses;
            const presentValue = netCashFlow / Math.pow(1 + discountRate, year);
            npv += presentValue;
            
            yearlyData.push({
                year,
                rentalIncome: annualRental,
                expenses,
                netCashFlow,
                presentValue,
                cumulativeNPV: -propertyPrice + yearlyData.reduce((sum, data) => sum + data.presentValue, 0) + presentValue
            });
        }
        
        // Add property sale value if selected
        let finalSaleValue = 0;
        if (sellProperty) {
            finalSaleValue = propertyPrice * Math.pow(1 + propertyGrowthRate, investmentHorizon);
            const presentValueOfSale = finalSaleValue / Math.pow(1 + discountRate, investmentHorizon);
            npv += presentValueOfSale;
            
            // Add to the last year's data
            if (yearlyData.length > 0) {
                const lastYear = yearlyData[yearlyData.length - 1];
                lastYear.netCashFlow += finalSaleValue;
                lastYear.presentValue += presentValueOfSale;
                lastYear.cumulativeNPV = npv;
            }
        }
        
        // Update results
        document.getElementById('npv-result').textContent = `₹ ${npv.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        document.getElementById('npv-sale-value').textContent = `₹ ${finalSaleValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        
        if (npv > 0) {
            document.getElementById('npv-viability').textContent = 'Viable Investment';
            document.getElementById('npv-viability-description').textContent = 'NPV > 0';
            document.getElementById('npv-viability').style.color = '#10b981'; // Green color
        } else {
            document.getElementById('npv-viability').textContent = 'Not Viable';
            document.getElementById('npv-viability-description').textContent = 'NPV < 0';
            document.getElementById('npv-viability').style.color = '#ef4444'; // Red color
        }
        
        // Update yearly breakdown table
        updateNPVTable(yearlyData);
        
        // Update chart
        updateNPVChart(yearlyData);
    }
    
    function updateNPVTable(yearlyData) {
        const scheduleTable = document.getElementById('npv-schedule').getElementsByTagName('tbody')[0];
        scheduleTable.innerHTML = '';
        
        yearlyData.forEach(data => {
            const row = scheduleTable.insertRow();
            
            row.insertCell(0).textContent = data.year;
            row.insertCell(1).textContent = `₹ ${data.rentalIncome.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            row.insertCell(2).textContent = `₹ ${data.expenses.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            row.insertCell(3).textContent = `₹ ${data.netCashFlow.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            row.insertCell(4).textContent = `₹ ${data.presentValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
            row.insertCell(5).textContent = `₹ ${data.cumulativeNPV.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        });
    }
    
    function updateNPVChart(yearlyData) {
        const ctx = document.getElementById('npv-chart').getContext('2d');
        
        // Prepare data
        const years = yearlyData.map(data => `Year ${data.year}`);
        const cashFlows = yearlyData.map(data => data.netCashFlow);
        const presentValues = yearlyData.map(data => data.presentValue);
        const cumulativeNPVs = yearlyData.map(data => data.cumulativeNPV);
        
        // Destroy previous chart if it exists
        if (window.npvChart) {
            window.npvChart.destroy();
        }
        
        window.npvChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Net Cash Flow',
                        data: cashFlows,
                        backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-color'),
                        borderWidth: 0
                    },
                    {
                        label: 'Present Value',
                        data: presentValues,
                        backgroundColor: getComputedStyle(document.body).getPropertyValue('--secondary-color'),
                        borderWidth: 0
                    },
                    {
                        label: 'Cumulative NPV',
                        data: cumulativeNPVs,
                        type: 'line',
                        borderColor: '#10b981',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointBorderWidth: 2,
                        pointBackgroundColor: '#10b981',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color-light')
                        }
                    },
                    y: {
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color-light'),
                            callback: function(value) {
                                return '₹ ' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color')
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let value = context.raw;
                                return `${context.dataset.label}: ₹ ${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Retirement Calculator
    function calculateRetirement() {
        const currentAge = parseInt(document.getElementById('retirement-current-age').value);
        const retirementAge = parseInt(document.getElementById('retirement-retirement-age').value);
        const lifeExpectancy = parseInt(document.getElementById('retirement-life-expectancy').value);
        const monthlyExpenses = parseFloat(document.getElementById('retirement-monthly-expenses').value);
        const inflationRate = parseFloat(document.getElementById('retirement-inflation-rate').value) / 100;
        const currentSavings = parseFloat(document.getElementById('retirement-current-savings').value);
        const monthlyContribution = parseFloat(document.getElementById('retirement-monthly-contribution').value);
        const preReturnRate = parseFloat(document.getElementById('retirement-pre-return-rate').value) / 100;
        const postReturnRate = parseFloat(document.getElementById('retirement-post-return-rate').value) / 100;
        const stepUpRate = parseFloat(document.getElementById('retirement-step-up-rate').value) / 100;
        
        // Years until retirement and years in retirement
        const yearsToRetirement = retirementAge - currentAge;
        const yearsInRetirement = lifeExpectancy - retirementAge;
        
        // Monthly expenses at retirement (adjusted for inflation)
        const expensesAtRetirement = monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
        const annualExpensesAtRetirement = expensesAtRetirement * 12;
        
        // Calculate required corpus at retirement
        let requiredCorpus = 0;
        
        // Calculate corpus needed for retirement
        // Using the formula for the present value of an annuity
        if (postReturnRate > inflationRate) {
            const realRate = (postReturnRate - inflationRate) / (1 + inflationRate);
            requiredCorpus = annualExpensesAtRetirement * (1 - Math.pow(1 + realRate, -yearsInRetirement)) / realRate;
        } else {
            // If real return rate is negative or zero, use simple multiplication
            requiredCorpus = annualExpensesAtRetirement * yearsInRetirement;
        }
        
        // Calculate expected corpus at retirement
        let expectedCorpus = currentSavings;
        const monthlyReturnRate = Math.pow(1 + preReturnRate, 1/12) - 1;
        
        // Calculate future value with increasing contributions (SIP step-up)
        let yearlyData = [];
        let currentContribution = monthlyContribution;
        
        for (let year = 1; year <= yearsToRetirement; year++) {
            let yearlyContribution = currentContribution * 12;
            
            // Compound for this year
            expectedCorpus = expectedCorpus * (1 + preReturnRate) + yearlyContribution * ((Math.pow(1 + monthlyReturnRate, 12) - 1) / monthlyReturnRate);
            
            yearlyData.push({
                age: currentAge + year,
                corpus: expectedCorpus,
                contribution: yearlyContribution
            });
            
            // Step up for next year
            currentContribution *= (1 + stepUpRate);
        }
        
        // Calculate monthly shortfall/surplus
        const shortfall = requiredCorpus - expectedCorpus;
        const monthsToRetirement = yearsToRetirement * 12;
        const additionalMonthlyContribution = shortfall > 0 
            ? shortfall / ((Math.pow(1 + monthlyReturnRate, monthsToRetirement) - 1) / monthlyReturnRate)
            : 0;
            
        // Update results
        document.getElementById('retirement-corpus-required').textContent = formatCurrency(requiredCorpus);
        document.getElementById('retirement-corpus-expected').textContent = formatCurrency(expectedCorpus);
        document.getElementById('retirement-monthly-shortfall').textContent = shortfall > 0 
            ? `₹ ${additionalMonthlyContribution.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
            : `₹ ${0}`;
        
        // Update recommendation
        document.getElementById('retirement-recommendation-1').textContent = shortfall > 0 
            ? `Increase your monthly contribution by at least ₹${additionalMonthlyContribution.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
            : 'Your retirement plan is on track!';
        
        // Update charts
        updateRetirementChart(yearlyData, requiredCorpus);
        updateRetirementAllocationChart(currentAge);
    }
    
    function formatCurrency(value) {
        if (value >= 10000000) {
            return `₹ ${(value / 10000000).toFixed(2)} Cr`;
        } else if (value >= 100000) {
            return `₹ ${(value / 100000).toFixed(2)} L`;
        } else {
            return `₹ ${value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        }
    }
    
    function updateRetirementChart(yearlyData, requiredCorpus) {
        const ctx = document.getElementById('retirement-chart').getContext('2d');
        
        // Prepare data
        const ages = yearlyData.map(data => data.age);
        const corpusValues = yearlyData.map(data => data.corpus);
        const contributions = yearlyData.map(data => data.contribution);
        
        // Destroy previous chart if it exists
        if (window.retirementChart) {
            window.retirementChart.destroy();
        }
        
        window.retirementChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ages,
                datasets: [
                    {
                        label: 'Expected Corpus',
                        data: corpusValues,
                        borderColor: getComputedStyle(document.body).getPropertyValue('--primary-color'),
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Annual Contribution',
                        data: contributions,
                        borderColor: getComputedStyle(document.body).getPropertyValue('--secondary-color'),
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0
                    },
                    {
                        label: 'Required Corpus',
                        data: Array(yearlyData.length).fill(requiredCorpus),
                        borderColor: '#ef4444',
                        backgroundColor: 'transparent',
                        borderDash: [3, 3],
                        tension: 0
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
                            text: 'Age',
                            color: getComputedStyle(document.body).getPropertyValue('--text-color')
                        },
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color-light')
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amount (₹)',
                            color: getComputedStyle(document.body).getPropertyValue('--text-color')
                        },
                        grid: {
                            color: getComputedStyle(document.body).getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color-light'),
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color')
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let value = context.raw;
                                return `${context.dataset.label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function updateRetirementAllocationChart(currentAge) {
        const ctx = document.getElementById('retirement-allocation-chart').getContext('2d');
        
        // Calculate allocation based on age
        let equity = Math.max(10, 100 - currentAge);
        let debt = 100 - equity;
        
        // Destroy previous chart if it exists
        if (window.allocationChart) {
            window.allocationChart.destroy();
        }
        
        window.allocationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Equity', 'Debt'],
                datasets: [{
                    data: [equity, debt],
                    backgroundColor: [
                        getComputedStyle(document.body).getPropertyValue('--primary-color'),
                        getComputedStyle(document.body).getPropertyValue('--secondary-color')
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color')
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let value = context.raw;
                                return `${context.label}: ${value}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Initialize calculators on page load
    calculateEMI();
    calculateNPV();
    calculateRetirement();
    
    // Add event listeners to calculator inputs
    document.getElementById('emi-loan-amount').addEventListener('input', calculateEMI);
    document.getElementById('emi-interest-rate').addEventListener('input', calculateEMI);
    document.getElementById('emi-loan-tenure').addEventListener('input', calculateEMI);
    
    document.getElementById('npv-property-price').addEventListener('input', calculateNPV);
    document.getElementById('npv-monthly-rental').addEventListener('input', calculateNPV);
    document.getElementById('npv-rental-growth').addEventListener('input', calculateNPV);
    document.getElementById('npv-maintenance-cost').addEventListener('input', calculateNPV);
    document.getElementById('npv-investment-horizon').addEventListener('input', calculateNPV);
    document.getElementById('npv-discount-rate').addEventListener('input', calculateNPV);
    document.getElementById('npv-property-growth').addEventListener('input', calculateNPV);
    document.getElementById('npv-sell-property').addEventListener('change', calculateNPV);
    
    document.getElementById('retirement-current-age').addEventListener('input', calculateRetirement);
    document.getElementById('retirement-retirement-age').addEventListener('input', calculateRetirement);
    document.getElementById('retirement-life-expectancy').addEventListener('input', calculateRetirement);
    document.getElementById('retirement-monthly-expenses').addEventListener('input', calculateRetirement);
    document.getElementById('retirement-inflation-rate').addEventListener('input', calculateRetirement);
    document.getElementById('retirement-current-savings').addEventListener('input', calculateRetirement);
    document.getElementById('retirement-monthly-contribution').addEventListener('input', calculateRetirement);
    document.getElementById('retirement-pre-return-rate').addEventListener('input', calculateRetirement);
    document.getElementById('retirement-post-return-rate').addEventListener('input', calculateRetirement);
    document.getElementById('retirement-step-up-rate').addEventListener('input', calculateRetirement);
}); 