// Amazon Seller Analytics Dashboard
class AmazonSellerAnalytics {
    constructor() {
        this.data = [];
        this.headers = [];
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.charts = {};
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload events
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const removeFileBtn = document.getElementById('removeFile');
        const processBtn = document.getElementById('processBtn');

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'text/csv') {
                this.handleFile(files[0]);
            } else {
                alert('Please upload a valid CSV file');
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });

        // Click to upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Remove file
        removeFileBtn?.addEventListener('click', () => {
            this.resetUpload();
        });

        // Process CSV
        processBtn?.addEventListener('click', () => {
            this.processCSV();
        });

        // Pagination
        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.data.length / this.rowsPerPage);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.renderTable();
            }
        });

        // Chart controls
        document.getElementById('chartType')?.addEventListener('change', () => {
            this.updateChart();
        });

        document.getElementById('chartColumn')?.addEventListener('change', () => {
            this.updateChart();
        });

        // Export buttons
        document.getElementById('exportJSON')?.addEventListener('click', () => {
            this.exportJSON();
        });

        document.getElementById('exportHTML')?.addEventListener('click', () => {
            this.exportHTML();
        });

        document.getElementById('printReport')?.addEventListener('click', () => {
            window.print();
        });
    }

    handleFile(file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit');
            return;
        }

        this.currentFile = file;
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('fileDetails').classList.remove('hidden');
    }

    resetUpload() {
        this.currentFile = null;
        this.data = [];
        this.headers = [];
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('fileDetails').classList.add('hidden');
        document.getElementById('fileInput').value = '';
        document.getElementById('reportSection').classList.add('hidden');
    }

    processCSV() {
        if (!this.currentFile) return;

        document.getElementById('loadingIndicator').classList.remove('hidden');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvData = e.target.result;
                this.parseCSV(csvData);
                this.generateReport();
                document.getElementById('loadingIndicator').classList.add('hidden');
                document.getElementById('reportSection').classList.remove('hidden');
            } catch (error) {
                console.error('Error processing CSV:', error);
                alert('Error processing CSV file. Please check the file format.');
                document.getElementById('loadingIndicator').classList.add('hidden');
            }
        };
        reader.readAsText(this.currentFile);
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('Empty CSV file');
        }

        // Parse headers
        this.headers = this.parseCSVLine(lines[0]);

        // Normalize headers (handle case variations)
        this.normalizedHeaders = {};
        this.headers.forEach(header => {
            const normalized = header.toLowerCase().trim();
            this.normalizedHeaders[normalized] = header;
        });

        // Parse data rows
        this.data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === this.headers.length) {
                const row = {};
                this.headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                this.data.push(row);
            }
        }
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    findColumn(possibleNames) {
        for (const name of possibleNames) {
            const normalized = name.toLowerCase();
            if (this.normalizedHeaders[normalized]) {
                return this.normalizedHeaders[normalized];
            }
        }
        return null;
    }

    generateReport() {
        this.renderKeyAlerts();
        this.renderPricingAnalysis();
        this.renderStorageAnalysis();
        this.renderSummaryStats();
        this.renderTable();
        this.renderColumnAnalysis();
        this.setupChartOptions();
        this.updateChart();
    }

    renderKeyAlerts() {
        const alertsContainer = document.getElementById('keyAlerts');
        const alerts = [];

        // Find relevant columns
        const priceCol = this.findColumn(['price', 'your price', 'current price', 'selling price']);
        const competitorPriceCol = this.findColumn(['competitor price', 'competitive price', 'market price', 'lowest price']);
        const storageCol = this.findColumn(['storage cost', 'storage fee', 'fba fee', 'storage']);
        const productCol = this.findColumn(['product name', 'product', 'name', 'title', 'item']);
        const listingAgeCol = this.findColumn(['listing age', 'age', 'days listed', 'listing age (days)']);

        // Analyze pricing competitiveness
        if (priceCol && competitorPriceCol) {
            const overpriced = this.data.filter(row => {
                const price = parseFloat(row[priceCol]);
                const compPrice = parseFloat(row[competitorPriceCol]);
                return !isNaN(price) && !isNaN(compPrice) && price > compPrice;
            });

            if (overpriced.length > 0) {
                const avgDiff = overpriced.reduce((sum, row) => {
                    return sum + (parseFloat(row[priceCol]) - parseFloat(row[competitorPriceCol]));
                }, 0) / overpriced.length;

                alerts.push({
                    type: 'danger',
                    icon: '⚠️',
                    title: `${overpriced.length} Products Priced Above Competition`,
                    description: `Average price difference: $${avgDiff.toFixed(2)}. Consider adjusting prices to remain competitive.`
                });
            }

            const underpriced = this.data.filter(row => {
                const price = parseFloat(row[priceCol]);
                const compPrice = parseFloat(row[competitorPriceCol]);
                return !isNaN(price) && !isNaN(compPrice) && price < compPrice * 0.9;
            });

            if (underpriced.length > 0) {
                alerts.push({
                    type: 'success',
                    icon: '✅',
                    title: `${underpriced.length} Products With Competitive Advantage`,
                    description: `These products are priced below competition. Consider if margins allow for current pricing.`
                });
            }
        }

        // Analyze storage costs
        if (storageCol) {
            const storageCosts = this.data.map(row => parseFloat(row[storageCol])).filter(val => !isNaN(val));
            if (storageCosts.length > 0) {
                const totalStorage = storageCosts.reduce((a, b) => a + b, 0);
                const avgStorage = totalStorage / storageCosts.length;
                const highStorage = this.data.filter(row => parseFloat(row[storageCol]) > avgStorage * 2).length;

                if (highStorage > 0) {
                    alerts.push({
                        type: 'warning',
                        icon: '📦',
                        title: `${highStorage} Products With High Storage Costs`,
                        description: `These products have storage costs above 2x average ($${avgStorage.toFixed(2)}). Consider inventory optimization.`
                    });
                }
            }
        }

        // Analyze aged inventory
        if (listingAgeCol) {
            const agedProducts = this.data.filter(row => {
                const age = parseFloat(row[listingAgeCol]);
                return !isNaN(age) && age > 180;
            });

            if (agedProducts.length > 0) {
                alerts.push({
                    type: 'info',
                    icon: '📅',
                    title: `${agedProducts.length} Products Listed Over 6 Months`,
                    description: `Consider promotional strategies or inventory reduction for slow-moving items.`
                });
            }
        }

        // Render alerts
        if (alerts.length === 0) {
            alerts.push({
                type: 'info',
                icon: 'ℹ️',
                title: 'No Critical Issues Detected',
                description: 'Your inventory appears to be well-managed. Continue monitoring for optimization opportunities.'
            });
        }

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
            </div>
        `).join('');
    }

    renderPricingAnalysis() {
        const analysisContainer = document.getElementById('pricingAnalysis');
        
        // Find relevant columns
        const priceCol = this.findColumn(['price', 'your price', 'current price', 'selling price']);
        const competitorPriceCol = this.findColumn(['competitor price', 'competitive price', 'market price', 'lowest price']);
        const productCol = this.findColumn(['product name', 'product', 'name', 'title', 'item']);

        if (!priceCol || !competitorPriceCol) {
            analysisContainer.innerHTML = '<p>Price comparison data not available. Ensure your CSV contains price and competitor price columns.</p>';
            return;
        }

        // Calculate pricing metrics
        const pricingData = this.data.map(row => ({
            product: row[productCol] || 'Unknown',
            price: parseFloat(row[priceCol]),
            competitorPrice: parseFloat(row[competitorPriceCol])
        })).filter(item => !isNaN(item.price) && !isNaN(item.competitorPrice));

        const overpriced = pricingData.filter(item => item.price > item.competitorPrice);
        const competitive = pricingData.filter(item => item.price <= item.competitorPrice);
        const totalPotentialSavings = overpriced.reduce((sum, item) => 
            sum + (item.price - item.competitorPrice), 0);

        // Render analysis cards
        analysisContainer.innerHTML = `
            <div class="analysis-item danger">
                <div class="analysis-label">Overpriced Products</div>
                <div class="analysis-value">${overpriced.length}</div>
            </div>
            <div class="analysis-item success">
                <div class="analysis-label">Competitively Priced</div>
                <div class="analysis-value">${competitive.length}</div>
            </div>
            <div class="analysis-item highlight">
                <div class="analysis-label">Potential Revenue Loss</div>
                <div class="analysis-value">$${totalPotentialSavings.toFixed(2)}</div>
            </div>
            <div class="analysis-item">
                <div class="analysis-label">Avg Price Difference</div>
                <div class="analysis-value">${overpriced.length > 0 ? 
                    '$' + (totalPotentialSavings / overpriced.length).toFixed(2) : '$0.00'}</div>
            </div>
        `;

        // Create pricing comparison chart
        this.createPricingChart(pricingData.slice(0, 10));
    }

    createPricingChart(data) {
        const ctx = document.getElementById('pricingChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.pricing) {
            this.charts.pricing.destroy();
        }

        this.charts.pricing = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => 
                    item.product.length > 20 ? item.product.substring(0, 20) + '...' : item.product
                ),
                datasets: [
                    {
                        label: 'Your Price',
                        data: data.map(item => item.price),
                        backgroundColor: 'rgba(79, 70, 229, 0.8)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Competitor Price',
                        data: data.map(item => item.competitorPrice),
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Price Comparison (Top 10 Products)'
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    renderStorageAnalysis() {
        const analysisContainer = document.getElementById('storageAnalysis');
        
        // Find relevant columns
        const storageCol = this.findColumn(['storage cost', 'storage fee', 'fba fee', 'storage']);
        const productCol = this.findColumn(['product name', 'product', 'name', 'title', 'item']);
        const unitsCol = this.findColumn(['units', 'quantity', 'units in stock', 'stock']);

        if (!storageCol) {
            analysisContainer.innerHTML = '<p>Storage cost data not available. Ensure your CSV contains a storage cost column.</p>';
            return;
        }

        // Calculate storage metrics
        const storageData = this.data.map(row => ({
            product: row[productCol] || 'Unknown',
            storageCost: parseFloat(row[storageCol]),
            units: unitsCol ? parseFloat(row[unitsCol]) : 0
        })).filter(item => !isNaN(item.storageCost));

        // Sort by storage cost
        storageData.sort((a, b) => b.storageCost - a.storageCost);

        const totalStorage = storageData.reduce((sum, item) => sum + item.storageCost, 0);
        const avgStorage = totalStorage / storageData.length;
        const highStorageItems = storageData.filter(item => item.storageCost > avgStorage * 1.5);
        const top5Storage = storageData.slice(0, 5).reduce((sum, item) => sum + item.storageCost, 0);

        // Render analysis cards
        analysisContainer.innerHTML = `
            <div class="analysis-item highlight">
                <div class="analysis-label">Total Storage Cost</div>
                <div class="analysis-value">$${totalStorage.toFixed(2)}</div>
            </div>
            <div class="analysis-item">
                <div class="analysis-label">Average Storage Cost</div>
                <div class="analysis-value">$${avgStorage.toFixed(2)}</div>
            </div>
            <div class="analysis-item danger">
                <div class="analysis-label">High Cost Items</div>
                <div class="analysis-value">${highStorageItems.length}</div>
            </div>
            <div class="analysis-item">
                <div class="analysis-label">Top 5 Items Cost</div>
                <div class="analysis-value">$${top5Storage.toFixed(2)}</div>
            </div>
        `;

        // Create storage cost chart
        this.createStorageChart(storageData.slice(0, 10));
    }

    createStorageChart(data) {
        const ctx = document.getElementById('storageChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.storage) {
            this.charts.storage.destroy();
        }

        // Generate gradient colors from high to low
        const colors = data.map((_, index) => {
            const ratio = index / data.length;
            const r = Math.floor(239 - ratio * 100);
            const g = Math.floor(68 + ratio * 150);
            const b = Math.floor(68 + ratio * 100);
            return `rgba(${r}, ${g}, ${b}, 0.8)`;
        });

        this.charts.storage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => 
                    item.product.length > 20 ? item.product.substring(0, 20) + '...' : item.product
                ),
                datasets: [{
                    label: 'Storage Cost',
                    data: data.map(item => item.storageCost),
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 Products by Storage Cost'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    renderSummaryStats() {
        const statsContainer = document.getElementById('summaryStats');
        
        // Calculate key metrics
        const priceCol = this.findColumn(['price', 'your price', 'current price', 'selling price']);
        const storageCol = this.findColumn(['storage cost', 'storage fee', 'fba fee', 'storage']);
        
        let avgPrice = 0;
        let totalStorage = 0;
        
        if (priceCol) {
            const prices = this.data.map(row => parseFloat(row[priceCol])).filter(val => !isNaN(val));
            avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        }
        
        if (storageCol) {
            const storageCosts = this.data.map(row => parseFloat(row[storageCol])).filter(val => !isNaN(val));
            totalStorage = storageCosts.length > 0 ? storageCosts.reduce((a, b) => a + b, 0) : 0;
        }

        const stats = [
            { label: 'Total Products', value: this.data.length.toLocaleString() },
            { label: 'Average Price', value: '$' + avgPrice.toFixed(2) },
            { label: 'Total Storage Cost', value: '$' + totalStorage.toFixed(2) },
            { label: 'Data Points', value: (this.data.length * this.headers.length).toLocaleString() }
        ];

        statsContainer.innerHTML = stats.map(stat => `
            <div class="stat-item">
                <div class="stat-label">${stat.label}</div>
                <div class="stat-value">${stat.value}</div>
            </div>
        `).join('');
    }

    renderTable() {
        const tableHead = document.getElementById('tableHead');
        const tableBody = document.getElementById('tableBody');
        
        // Render headers
        tableHead.innerHTML = `
            <tr>
                <th>#</th>
                ${this.headers.map(header => `<th>${this.escapeHtml(header)}</th>`).join('')}
            </tr>
        `;

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.rowsPerPage;
        const endIndex = Math.min(startIndex + this.rowsPerPage, this.data.length);
        const pageData = this.data.slice(startIndex, endIndex);

        // Render rows with conditional formatting
        const priceCol = this.findColumn(['price', 'your price', 'current price', 'selling price']);
        const competitorPriceCol = this.findColumn(['competitor price', 'competitive price', 'market price', 'lowest price']);

        tableBody.innerHTML = pageData.map((row, index) => {
            let rowClass = '';
            if (priceCol && competitorPriceCol) {
                const price = parseFloat(row[priceCol]);
                const compPrice = parseFloat(row[competitorPriceCol]);
                if (!isNaN(price) && !isNaN(compPrice) && price > compPrice) {
                    rowClass = 'style="background-color: #fee2e2;"';
                }
            }

            return `
                <tr ${rowClass}>
                    <td>${startIndex + index + 1}</td>
                    ${this.headers.map(header => `<td>${this.escapeHtml(row[header] || '')}</td>`).join('')}
                </tr>
            `;
        }).join('');

        // Update pagination info
        const totalPages = Math.ceil(this.data.length / this.rowsPerPage);
        document.getElementById('pageInfo').textContent = `Page ${this.currentPage} of ${totalPages}`;
        
        // Enable/disable pagination buttons
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;
    }

    renderColumnAnalysis() {
        const analysisContainer = document.getElementById('columnAnalysis');
        const columnAnalysis = this.headers.map(header => {
            const columnData = this.data.map(row => row[header]);
            const analysis = this.analyzeColumn(header, columnData);
            
            return `
                <div class="column-card">
                    <div class="column-name">${this.escapeHtml(header)}</div>
                    <div class="column-info">
                        <span>Type: ${analysis.type}</span>
                        <span>Unique Values: ${analysis.uniqueCount}</span>
                        <span>Empty Values: ${analysis.emptyCount}</span>
                        ${analysis.type === 'numeric' ? `
                            <span>Min: ${analysis.min}</span>
                            <span>Max: ${analysis.max}</span>
                            <span>Average: ${analysis.average}</span>
                        ` : `
                            <span>Most Common: ${this.escapeHtml(analysis.mostCommon)}</span>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        analysisContainer.innerHTML = columnAnalysis;
    }

    analyzeColumn(header, columnData) {
        const nonEmpty = columnData.filter(val => val && val.trim() !== '');
        const uniqueValues = new Set(nonEmpty);
        const emptyCount = columnData.length - nonEmpty.length;
        
        // Check if numeric
        const numericValues = nonEmpty.map(val => parseFloat(val)).filter(val => !isNaN(val));
        const isNumeric = numericValues.length > nonEmpty.length * 0.8;

        if (isNumeric && numericValues.length > 0) {
            const min = Math.min(...numericValues);
            const max = Math.max(...numericValues);
            const sum = numericValues.reduce((a, b) => a + b, 0);
            const average = (sum / numericValues.length).toFixed(2);
            
            return {
                type: 'numeric',
                uniqueCount: uniqueValues.size,
                emptyCount,
                min: min.toFixed(2),
                max: max.toFixed(2),
                average
            };
        } else {
            // Find most common value
            const frequency = {};
            nonEmpty.forEach(val => {
                frequency[val] = (frequency[val] || 0) + 1;
            });
            
            const mostCommon = Object.keys(frequency).reduce((a, b) => 
                frequency[a] > frequency[b] ? a : b, '');
            
            return {
                type: 'text',
                uniqueCount: uniqueValues.size,
                emptyCount,
                mostCommon: mostCommon || 'N/A'
            };
        }
    }

    setupChartOptions() {
        const chartColumn = document.getElementById('chartColumn');
        chartColumn.innerHTML = '<option value="">Select Column</option>' +
            this.headers.map(header => `<option value="${header}">${this.escapeHtml(header)}</option>`).join('');
        
        // Select first numeric column by default
        const numericColumns = this.headers.filter(header => {
            const columnData = this.data.map(row => row[header]);
            const numericValues = columnData.map(val => parseFloat(val)).filter(val => !isNaN(val));
            return numericValues.length > columnData.length * 0.5;
        });

        if (numericColumns.length > 0) {
            chartColumn.value = numericColumns[0];
        }
    }

    updateChart() {
        const chartType = document.getElementById('chartType').value;
        const columnName = document.getElementById('chartColumn').value;
        
        if (!columnName) return;

        const columnData = this.data.map(row => row[columnName]);
        const chartData = this.prepareChartData(columnName, columnData, chartType);

        // Destroy existing chart
        if (this.charts.main) {
            this.charts.main.destroy();
        }

        // Create new chart
        const ctx = document.getElementById('dataChart').getContext('2d');
        this.charts.main = new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: chartType === 'pie' || chartType === 'doughnut',
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: `${columnName} Distribution`
                    }
                },
                scales: chartType === 'bar' || chartType === 'line' ? {
                    y: {
                        beginAtZero: true
                    }
                } : {}
            }
        });
    }

    prepareChartData(columnName, columnData, chartType) {
        const frequency = {};
        columnData.forEach(val => {
            const key = val || 'Empty';
            frequency[key] = (frequency[key] || 0) + 1;
        });

        // Sort and limit to top 10 for better visualization
        const sorted = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        const labels = sorted.map(item => item[0]);
        const data = sorted.map(item => item[1]);

        // Generate colors
        const colors = this.generateColors(labels.length);

        return {
            labels: labels,
            datasets: [{
                label: columnName,
                data: data,
                backgroundColor: chartType === 'line' ? colors[0] : colors,
                borderColor: chartType === 'line' ? colors[0] : colors,
                borderWidth: chartType === 'line' ? 2 : 1,
                fill: chartType === 'line' ? false : true
            }]
        };
    }

    generateColors(count) {
        const colors = [];
        const hueStep = 360 / count;
        for (let i = 0; i < count; i++) {
            const hue = i * hueStep;
            colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
        }
        return colors;
    }

    exportJSON() {
        const priceCol = this.findColumn(['price', 'your price', 'current price', 'selling price']);
        const competitorPriceCol = this.findColumn(['competitor price', 'competitive price', 'market price', 'lowest price']);
        const storageCol = this.findColumn(['storage cost', 'storage fee', 'fba fee', 'storage']);

        const analysis = {
            overpriced_products: [],
            high_storage_products: []
        };

        if (priceCol && competitorPriceCol) {
            analysis.overpriced_products = this.data.filter(row => {
                const price = parseFloat(row[priceCol]);
                const compPrice = parseFloat(row[competitorPriceCol]);
                return !isNaN(price) && !isNaN(compPrice) && price > compPrice;
            });
        }

        if (storageCol) {
            const storageCosts = this.data.map(row => parseFloat(row[storageCol])).filter(val => !isNaN(val));
            const avgStorage = storageCosts.reduce((a, b) => a + b, 0) / storageCosts.length;
            analysis.high_storage_products = this.data.filter(row => parseFloat(row[storageCol]) > avgStorage * 1.5);
        }

        const reportData = {
            fileName: this.currentFile.name,
            processedAt: new Date().toISOString(),
            summary: {
                totalProducts: this.data.length,
                totalColumns: this.headers.length,
                headers: this.headers
            },
            analysis: analysis,
            data: this.data
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, `${this.currentFile.name.replace('.csv', '')}_analysis.json`);
    }

    exportHTML() {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Amazon Seller Report - ${this.currentFile.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .summary { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .alert { padding: 10px; margin: 10px 0; border-radius: 5px; }
                    .alert.danger { background: #fee2e2; border-left: 4px solid #ef4444; }
                    .alert.warning { background: #fef3c7; border-left: 4px solid #f59e0b; }
                </style>
            </head>
            <body>
                <h1>Amazon Seller Analytics Report</h1>
                <div class="summary">
                    <h2>Summary</h2>
                    <p>File: ${this.currentFile.name}</p>
                    <p>Total Products: ${this.data.length}</p>
                    <p>Total Columns: ${this.headers.length}</p>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                </div>
                <div id="alerts">
                    ${document.getElementById('keyAlerts').innerHTML}
                </div>
                <h2>Product Data</h2>
                <table>
                    <thead>
                        <tr>
                            ${this.headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.data.map(row => `
                            <tr>
                                ${this.headers.map(h => `<td>${this.escapeHtml(row[h] || '')}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        this.downloadFile(blob, `${this.currentFile.name.replace('.csv', '')}_report.html`);
    }

    downloadFile(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AmazonSellerAnalytics();
});