import React, { useState, useCallback } from 'react';
import { Download, Grid2x2 as Grid, Settings, FileImage } from 'lucide-react';

interface GridSettings {
  pageWidth: number;
  pageHeight: number;
  pageUnit: 'mm' | 'cm' | 'in';
  gridType: 'lines' | 'dots';
  gridSpacingX: number;
  gridSpacingY: number;
  lineWidth: number;
  dotSize: number;
  rectangleWidth: number;
  rectangleHeight: number;
  rectangleBorderWidth: number;
}

function App() {
  const [settings, setSettings] = useState<GridSettings>({
    pageWidth: 210, // A4 width
    pageHeight: 297, // A4 height
    pageUnit: 'mm',
    gridSpacingX: 10,
    gridSpacingY: 10,
    lineWidth: 0.2,
    rectangleWidth: 100,
    rectangleHeight: 80,
    rectangleBorderWidth: 0.4,
  });

  const updateSetting = useCallback((key: keyof GridSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const generateSVG = useCallback(() => {
    const { 
      pageWidth, pageHeight, pageUnit, gridSpacingX, gridSpacingY, lineWidth,
      rectangleWidth, rectangleHeight, rectangleBorderWidth
    } = settings;

    // Convert page dimensions to mm
    let pageWidthMm = pageWidth;
    let pageHeightMm = pageHeight;
    
    if (pageUnit === 'cm') {
      pageWidthMm = pageWidth * 10;
      pageHeightMm = pageHeight * 10;
    } else if (pageUnit === 'in') {
      pageWidthMm = pageWidth * 25.4;
      pageHeightMm = pageHeight * 25.4;
    }

    // Calculate centered rectangle position
    const rectangleX = (pageWidthMm - rectangleWidth) / 2;
    const rectangleY = (pageHeightMm - rectangleHeight) / 2;

    // Convert mm to pixels (assuming 1mm = 3.779527559 pixels at 96 DPI)
    const mmToPixel = 3.779527559;
    
    const svgWidth = pageWidthMm * mmToPixel;
    const svgHeight = pageHeightMm * mmToPixel;
    const rectW = rectangleWidth * mmToPixel;
    const rectH = rectangleHeight * mmToPixel;
    const rectX = rectangleX * mmToPixel;
    const rectY = rectangleY * mmToPixel;
    
    const spacingX = gridSpacingX * mmToPixel;
    const spacingY = gridSpacingY * mmToPixel;
    
    let gridLines = '';
    
    // Calculate grid bounds - extend beyond rectangle
    // Grid extends 2-3 grid spacings beyond rectangle on each side
    // Grid bounds are exactly the rectangle boundaries
    const gridStartX = rectX;
    const gridEndX = rectX + rectW;
    const gridStartY = rectY;
    const gridEndY = rectY + rectH;
    
    // Align grid to start from rectangle edges
    const alignedStartX = rectX;
    const alignedStartY = rectY;
    
    // Generate vertical lines
    for (let x = alignedStartX; x <= gridEndX; x += spacingX) {
      if (x >= rectX && x <= rectX + rectW) {
        gridLines += `<line x1="${x}" y1="${gridStartY}" x2="${x}" y2="${gridEndY}" stroke="#666" stroke-width="${lineWidth * mmToPixel}" />\n`;
      }
    }
    
    // Generate horizontal lines
    for (let y = alignedStartY; y <= gridEndY; y += spacingY) {
      if (y >= rectY && y <= rectY + rectH) {
        gridLines += `<line x1="${gridStartX}" y1="${y}" x2="${gridEndX}" y2="${y}" stroke="#666" stroke-width="${lineWidth * mmToPixel}" />\n`;
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${pageWidthMm}mm" height="${pageHeightMm}mm" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .page-boundary { fill: none; stroke: #000; stroke-width: 1; }
      .rectangle { fill: none; stroke: #000; stroke-width: ${rectangleBorderWidth * mmToPixel}; }
      .grid-line { stroke: #666; stroke-width: ${lineWidth * mmToPixel}; }
    </style>
  </defs>
  
  <!-- Page boundary -->
  <rect class="page-boundary" x="0" y="0" width="${svgWidth}" height="${svgHeight}" />
  
  <!-- Grid lines -->
  ${gridLines}
  
  <!-- Rectangle -->
  <rect class="rectangle" x="${rectX}" y="${rectY}" width="${rectW}" height="${rectH}" />
</svg>`;
  }, [settings]);

  const downloadSVG = useCallback(() => {
    const svgContent = generateSVG();
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grid-pattern.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generateSVG]);

  const previewSVG = generateSVG();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Grid className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">SVG Grid Generator</h1>
          </div>
          <p className="text-gray-600 text-lg">Create precision grid patterns with customizable spacing and dimensions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Page Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 border-b pb-2">Page Dimensions</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Unit</label>
                    <select
                      value={settings.pageUnit}
                      onChange={(e) => updateSetting('pageUnit', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="mm">Millimeters (mm)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="in">Inches (in)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Width ({settings.pageUnit})</label>
                      <input
                        type="number"
                        step={settings.pageUnit === 'in' ? '0.1' : '1'}
                        value={settings.pageWidth}
                        onChange={(e) => updateSetting('pageWidth', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Height ({settings.pageUnit})</label>
                      <input
                        type="number"
                        step={settings.pageUnit === 'in' ? '0.1' : '1'}
                        value={settings.pageHeight}
                        onChange={(e) => updateSetting('pageHeight', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Common sizes: A4 (210×297mm, 21×29.7cm, 8.27×11.69in) • Letter (8.5×11in, 21.6×27.9cm, 216×279mm)
                  </div>
                </div>

                {/* Grid Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 border-b pb-2">Grid Settings</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Grid Type</label>
                    <select
                      value={settings.gridType}
                      onChange={(e) => setSettings(prev => ({ ...prev, gridType: e.target.value as 'lines' | 'dots' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="lines">Grid Lines</option>
                      <option value="dots">Dots</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">X Spacing (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.gridSpacingX}
                        onChange={(e) => updateSetting('gridSpacingX', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Y Spacing (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.gridSpacingY}
                        onChange={(e) => updateSetting('gridSpacingY', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {settings.gridType === 'lines' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Line Width (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.lineWidth}
                        onChange={(e) => updateSetting('lineWidth', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  {settings.gridType === 'dots' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Dot Size (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.dotSize}
                        onChange={(e) => updateSetting('dotSize', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Rectangle Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700 border-b pb-2">Rectangle</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Width (mm)</label>
                      <input
                        type="number"
                        value={settings.rectangleWidth}
                        onChange={(e) => updateSetting('rectangleWidth', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Height (mm)</label>
                      <input
                        type="number"
                        value={settings.rectangleHeight}
                        onChange={(e) => updateSetting('rectangleHeight', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                    Rectangle is automatically centered on the page
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Border Width (mm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.rectangleBorderWidth}
                      onChange={(e) => updateSetting('rectangleBorderWidth', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadSVG}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Download SVG
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <FileImage className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Preview</h2>
                <span className="text-sm text-gray-500 ml-2">
                  {settings.pageWidth}{settings.pageUnit} × {settings.pageHeight}{settings.pageUnit}
                </span>
              </div>
              
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto">
                <div className="flex justify-center">
                  <div 
                    className="bg-white border border-gray-300 shadow-sm"
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: previewSVG }} />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                {settings.gridType === 'lines' ? 'Grid Lines' : 'Dots'}: {settings.gridSpacingX}mm × {settings.gridSpacingY}mm spacing •
                {settings.gridType === 'lines' ? `Line width: ${settings.lineWidth}mm` : `Dot size: ${settings.dotSize}mm`} •
                Rectangle: {settings.rectangleWidth}mm × {settings.rectangleHeight}mm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;