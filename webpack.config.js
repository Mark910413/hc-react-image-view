const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const htmlWebpackPlugin = new HtmlWebpackPlugin({
 template: path.join(__dirname, "./examples/index.html"),
 filename: "./index.html"
});
module.exports = {
 entry: path.join(__dirname, "examples/Index.jsx"),

 devtool: 'inline-source-map',
 module: {
   rules: [{
     test: /\.(js|jsx)$/,
   use: "babel-loader",
   exclude: /node_modules/
 },{
   test: /\.(css|less)$/,
   use: ["style-loader", "css-loader", "less-loader"]
 }]
},
 plugins: [htmlWebpackPlugin],
 resolve: {
   extensions: [".js", ".jsx"]
 },
 devServer: {
   port: 3000,
   host: '0.0.0.0'
}};