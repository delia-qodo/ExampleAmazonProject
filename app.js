// CSV Data Analyzer Application
class CSVAnalyzer {
    constructor() {
        this.data = [];
        this.headers = [];
        this.currentPage = 1;
        this.rowsPerPage = 10;
        this.chart = null;
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

    generateReport() {
        this.renderSummaryStats();
        this.renderTable();
        this.renderColumnAnalysis();
        this.setupChartOptions();
        this.updateChart();
    }

    renderSummaryStats() {
        const statsContainer = document.getElementById('summaryStats');
        const stats = [
            { label: 'Total Rows', value: this.data.length.toLocaleString() },
            { label: 'Total Columns', value: this.headers.length.toLocaleString() },
            { label: 'File Size', value: this.formatFileSize(this.currentFile.size) },
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

        // Render rows
        tableBody.innerHTML = pageData.map((row, index) => `
            <tr>
                <td>${startIndex + index + 1}</td>
                ${this.headers.map(header => `<td>${this.escapeHtml(row[header] || '')}</td>`).join('')}
            </tr>
        `).join('');

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
        
        // Select first column by default
        if (this.headers.length > 0) {
            chartColumn.value = this.headers[0];
        }
    }

    updateChart() {
        const chartType = document.getElementById('chartType').value;
        const columnName = document.getElementById('chartColumn').value;
        
        if (!columnName) return;

        const columnData = this.data.map(row => row[columnName]);
        const chartData = this.prepareChartData(columnName, columnData, chartType);

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Create new chart
        const ctx = document.getElementById('dataChart').getContext('2d');
        this.chart = new Chart(ctx, {
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
        const reportData = {
            fileName: this.currentFile.name,
            processedAt: new Date().toISOString(),
            summary: {
                totalRows: this.data.length,
                totalColumns: this.headers.length,
                headers: this.headers
            },
            data: this.data
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, `${this.currentFile.name.replace('.csv', '')}_report.json`);
    }

    exportHTML() {
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>CSV Report - ${this.currentFile.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .summary { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <h1>CSV Data Report</h1>
                <div class="summary">
                    <h2>Summary</h2>
                    <p>File: ${this.currentFile.name}</p>
                    <p>Total Rows: ${this.data.length}</p>
                    <p>Total Columns: ${this.headers.length}</p>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                </div>
                <h2>Data</h2>
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

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CSVAnalyzer();
});