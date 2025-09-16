# Amazon Seller Analytics Dashboard

A powerful web application designed specifically for Amazon sellers to analyze their product inventory, pricing competitiveness, and storage costs through CSV report uploads.

## 🎯 Purpose

This dashboard helps Amazon sellers make data-driven decisions by:
- Identifying products priced higher than competitors
- Highlighting products with excessive storage costs
- Analyzing inventory age and suggesting optimization strategies
- Providing actionable insights to improve profitability

## 🚀 Key Features

### Pricing Competitiveness Analysis
- **Overpriced Product Detection**: Automatically identifies products priced above competitor prices
- **Price Comparison Visualization**: Side-by-side bar charts comparing your prices with competitors
- **Potential Revenue Loss Calculation**: Shows how much you might be losing due to overpricing
- **Competitive Advantage Identification**: Highlights products priced below competition

### Storage Cost Analysis
- **High Storage Cost Detection**: Identifies products with storage costs above average
- **Cost Distribution Visualization**: Visual breakdown of storage costs across your inventory
- **Top Cost Contributors**: Highlights the products consuming most storage budget
- **Storage Optimization Recommendations**: Suggests which products need inventory reduction

### Key Alerts & Opportunities
- **Real-time Alerts**: Instant notifications about critical issues
- **Actionable Insights**: Specific recommendations for each identified issue
- **Priority Classification**: Color-coded alerts (danger, warning, success, info)
- **Aged Inventory Detection**: Identifies slow-moving products over 6 months old

### Additional Features
- **Data Preview**: Paginated table view with conditional formatting
- **Column Analysis**: Automatic data type detection and statistical analysis
- **Custom Visualizations**: Multiple chart types for different data perspectives
- **Export Options**: JSON and HTML report generation
- **Print-Ready Reports**: Formatted reports for offline review

## 📊 Required CSV Format

Your CSV file should include the following columns (case-insensitive):

### Essential Columns:
- **Product Name**: Name or title of the product
- **Price**: Your current selling price
- **Competitor Price**: Lowest competitor price or market price
- **Storage Cost**: Monthly storage fees or FBA fees
- **Listing Age (Days)**: How long the product has been listed

### Optional Columns:
- **SKU**: Product identifier
- **Units in Stock**: Current inventory quantity
- **Category**: Product category
- **Sales Rank**: Amazon sales rank
- **Monthly Sales**: Units sold per month

## 🚦 Getting Started

1. **Open the Application**
   ```
   Open index.html in any modern web browser
   ```

2. **Upload Your CSV**
   - Drag and drop your Amazon seller report CSV
   - Or click "Browse Files" to select
   - Maximum file size: 10MB

3. **Review Analysis**
   - Check Key Alerts for immediate action items
   - Review Pricing Competitiveness section
   - Analyze Storage Cost breakdown
   - Export reports for team sharing

## 📁 Project Structure

```
ExampleAmazonProject/
├── index.html          # Main application interface
├── styles.css          # Styling with alert-specific designs
├── app.js             # Amazon seller analytics logic
├── sample-data.csv    # Sample Amazon seller data
└── README.md          # Documentation
```

## 💡 Use Cases

### For Amazon FBA Sellers
- Optimize pricing strategy against competitors
- Reduce long-term storage fees
- Identify slow-moving inventory
- Improve profit margins

### For Inventory Managers
- Monitor storage cost trends
- Plan inventory reduction sales
- Identify products for removal
- Optimize warehouse space

### For Pricing Analysts
- Track competitive positioning
- Identify pricing opportunities
- Monitor market trends
- Adjust pricing strategies

## 🎨 Visual Indicators

### Alert Types
- 🔴 **Danger (Red)**: Critical issues requiring immediate attention
- 🟡 **Warning (Yellow)**: Important issues to address soon
- 🟢 **Success (Green)**: Positive indicators or opportunities
- 🔵 **Info (Blue)**: General information and suggestions

### Table Highlighting
- **Red Background**: Products priced above competitors
- **Normal Background**: Competitively priced products

## 📈 Metrics Calculated

### Pricing Metrics
- Number of overpriced products
- Average price difference from competitors
- Potential revenue loss
- Competitive advantage percentage

### Storage Metrics
- Total storage costs
- Average storage cost per product
- High-cost product identification
- Storage cost distribution

### Inventory Metrics
- Product age analysis
- Slow-moving inventory detection
- Turnover recommendations

## 🔒 Data Privacy

- **100% Client-Side Processing**: All data analysis happens in your browser
- **No Server Upload**: Your data never leaves your computer
- **No External Dependencies**: No third-party data sharing
- **Secure Processing**: Your competitive data remains confidential

## 📱 Browser Compatibility

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## 🛠️ Technologies Used

- **HTML5**: Semantic structure
- **CSS3**: Modern styling with gradients and animations
- **JavaScript ES6+**: Advanced data processing
- **Chart.js**: Interactive data visualizations
- **No Backend Required**: Fully client-side application

## 📝 Sample Data

The included `sample-data.csv` contains example Amazon seller data with:
- 20 products with realistic pricing
- Competitor price comparisons
- Storage cost variations
- Different listing ages
- Various product categories

## 🚀 Quick Test

1. Open `index.html` in your browser
2. Upload the included `sample-data.csv`
3. Review the automated analysis
4. Explore different visualizations
5. Export a sample report

## 🤝 Support

For Amazon sellers looking to:
- Improve pricing competitiveness
- Reduce storage costs
- Optimize inventory management
- Increase profitability

This tool provides the insights you need to make informed decisions.

## 📄 License

MIT License - Free to use and modify for your business needs.

---

**Built for Amazon Sellers, by Amazon Sellers** 📦

Optimize your Amazon business with data-driven insights!