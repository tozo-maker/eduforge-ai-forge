
import { Outline, OutlineNode } from '@/types/outline';
import { jsPDF } from 'jspdf';
import { createElement } from 'react';
import html2canvas from 'html2canvas';
import { EducationalStandard } from '@/types/project';

interface ExportOptions {
  includeStandards: boolean;
  includeWordCounts: boolean;
  includeTimeEstimates: boolean;
  includeRelationships: boolean;
  includeNotes: boolean;
  includeReferences: boolean;
  includeAssessmentPoints: boolean;
  quality: 'draft' | 'standard' | 'high';
  paperSize: 'a4' | 'letter';
  includePageNumbers: boolean;
  includeTableOfContents: boolean;
}

// Helper to find all educational standards referenced in the outline
const getReferencedStandards = (nodes: OutlineNode[], standards: EducationalStandard[]): EducationalStandard[] => {
  const standardIds = new Set<string>();
  
  // Helper to recursively collect all standard IDs
  const collectStandardIds = (node: OutlineNode) => {
    if (node.standardIds && node.standardIds.length > 0) {
      node.standardIds.forEach(id => standardIds.add(id));
    }
    node.children.forEach(collectStandardIds);
  };
  
  nodes.forEach(collectStandardIds);
  
  // Filter standards to only include those referenced in the outline
  return standards.filter(std => standardIds.has(std.id));
};

// PDF Export Function
export const exportToPDF = async (
  outline: Outline, 
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<{ url: string; filename: string }> => {
  onProgress?.(0.1);
  
  // Set up PDF with appropriate page size
  const isPaperA4 = options.paperSize === 'a4';
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isPaperA4 ? 'a4' : 'letter'
  });
  
  let currentPage = 1;
  let y = 20; // Starting y position
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  // Add title
  pdf.setFontSize(24);
  pdf.text(outline.title, pageWidth / 2, y, { align: 'center' });
  y += 10;
  
  // Add description if available
  if (outline.description) {
    pdf.setFontSize(12);
    pdf.text(outline.description, margin, y);
    y += 10;
  }
  
  onProgress?.(0.2);
  
  // Add table of contents if requested
  if (options.includeTableOfContents) {
    pdf.setFontSize(16);
    pdf.text("Table of Contents", margin, y);
    y += 10;
    
    // Simple table of contents generation
    const addTocItem = (node: OutlineNode, level: number) => {
      const indent = level * 5;
      pdf.setFontSize(12 - level);
      
      // Check if we need to add a new page
      if (y > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        currentPage++;
        y = 20;
        
        // Add page number if requested
        if (options.includePageNumbers) {
          pdf.setFontSize(10);
          pdf.text(`Page ${currentPage}`, pageWidth - margin, pdf.internal.pageSize.getHeight() - 10);
        }
      }
      
      pdf.text(`${node.title}`, margin + indent, y);
      y += 6;
      
      // Recursively add children to TOC
      node.children.forEach(child => addTocItem(child, level + 1));
    };
    
    outline.rootNodes.forEach(node => addTocItem(node, 0));
    
    // Add a page break after TOC
    pdf.addPage();
    currentPage++;
    y = 20;
  }
  
  onProgress?.(0.3);
  
  // Helper function to render a node and its children
  const renderNode = (node: OutlineNode, level: number) => {
    const indent = level * 5;
    
    // Check if we need to add a new page
    if (y > pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();
      currentPage++;
      y = 20;
      
      // Add page number if requested
      if (options.includePageNumbers) {
        pdf.setFontSize(10);
        pdf.text(`Page ${currentPage}`, pageWidth - margin, pdf.internal.pageSize.getHeight() - 10);
      }
    }
    
    // Node title
    pdf.setFontSize(16 - level * 2);
    pdf.text(node.title, margin + indent, y);
    y += 8;
    
    // Node description if available
    if (node.description) {
      pdf.setFontSize(12);
      pdf.text(node.description, margin + indent, y);
      y += 6;
    }
    
    // Add meta information like word count, time, etc.
    const metaItems = [];
    if (options.includeWordCounts) metaItems.push(`Words: ${node.estimatedWordCount}`);
    if (options.includeTimeEstimates) metaItems.push(`Time: ${node.estimatedDuration} min`);
    if (node.difficultyLevel) metaItems.push(`Difficulty: ${node.difficultyLevel}`);
    if (node.taxonomyLevel) metaItems.push(`Taxonomy: ${node.taxonomyLevel}`);
    
    if (metaItems.length > 0) {
      pdf.setFontSize(10);
      pdf.text(metaItems.join(' | '), margin + indent, y);
      y += 6;
    }
    
    // Standards if requested
    if (options.includeStandards && node.standardIds && node.standardIds.length > 0) {
      pdf.setFontSize(10);
      pdf.text(`Standards: ${node.standardIds.join(', ')}`, margin + indent, y);
      y += 6;
    }
    
    // Add a little space before rendering children
    y += 4;
    
    // Recursively render children
    node.children.forEach(child => renderNode(child, level + 1));
  };
  
  // Render all nodes
  outline.rootNodes.forEach((node, index) => {
    // For second and subsequent root nodes, add some extra spacing
    if (index > 0) y += 10;
    renderNode(node, 0);
  });
  
  onProgress?.(0.6);
  
  // Add references section if requested
  if (options.includeReferences && outline.references && outline.references.length > 0) {
    // Add a page break before references
    pdf.addPage();
    currentPage++;
    y = 20;
    
    // Add page number if requested
    if (options.includePageNumbers) {
      pdf.setFontSize(10);
      pdf.text(`Page ${currentPage}`, pageWidth - margin, pdf.internal.pageSize.getHeight() - 10);
    }
    
    pdf.setFontSize(16);
    pdf.text("References", margin, y);
    y += 10;
    
    // List all references
    pdf.setFontSize(12);
    outline.references.forEach((ref, index) => {
      // Check if we need to add a new page
      if (y > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        currentPage++;
        y = 20;
        
        // Add page number if requested
        if (options.includePageNumbers) {
          pdf.setFontSize(10);
          pdf.text(`Page ${currentPage}`, pageWidth - margin, pdf.internal.pageSize.getHeight() - 10);
        }
      }
      
      const refText = `${index + 1}. ${ref.title}${ref.url ? ` - ${ref.url}` : ''}`;
      pdf.text(refText, margin, y, { 
        maxWidth: contentWidth,
      });
      
      // Estimate how many lines were used
      const approxLines = Math.ceil(pdf.getTextWidth(refText) / contentWidth);
      y += 6 * approxLines;
      
      // Add notes if available
      if (ref.notes) {
        pdf.setFontSize(10);
        pdf.text(`Note: ${ref.notes}`, margin + 5, y);
        y += 6;
      }
    });
  }
  
  onProgress?.(0.8);
  
  // Add page numbers if requested
  if (options.includePageNumbers) {
    for (let i = 1; i <= currentPage; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(`Page ${i} of ${currentPage}`, pageWidth - margin, pdf.internal.pageSize.getHeight() - 10);
    }
  }
  
  onProgress?.(0.9);
  
  // Generate the PDF file
  const pdfBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  onProgress?.(1);
  
  return {
    url: pdfUrl,
    filename: `${outline.title}.pdf`
  };
};

// DOCX Export Function
export const exportToDocx = async (
  outline: Outline, 
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<{ url: string; filename: string }> => {
  // Since we can't use docx library directly in browser without additional setup,
  // we'll simulate the DOCX generation here
  
  onProgress?.(0.2);
  
  // Create HTML representation that will be converted to DOCX by the backend
  const htmlContent = document.createElement('div');
  htmlContent.className = 'outline-export';
  
  // Add title and description
  const titleElement = document.createElement('h1');
  titleElement.textContent = outline.title;
  htmlContent.appendChild(titleElement);
  
  if (outline.description) {
    const descElement = document.createElement('p');
    descElement.textContent = outline.description;
    htmlContent.appendChild(descElement);
  }
  
  onProgress?.(0.4);
  
  // Helper function to render a node and its children as HTML
  const renderNodeAsHtml = (node: OutlineNode, level: number) => {
    const nodeContainer = document.createElement('div');
    nodeContainer.className = `outline-node level-${level}`;
    nodeContainer.style.marginLeft = `${level * 20}px`;
    
    // Node title
    const nodeTitle = document.createElement(`h${Math.min(level + 2, 6)}`);
    nodeTitle.textContent = node.title;
    nodeContainer.appendChild(nodeTitle);
    
    // Node description
    if (node.description) {
      const nodeDesc = document.createElement('p');
      nodeDesc.textContent = node.description;
      nodeContainer.appendChild(nodeDesc);
    }
    
    // Meta information
    const metaItems = [];
    if (options.includeWordCounts) metaItems.push(`Words: ${node.estimatedWordCount}`);
    if (options.includeTimeEstimates) metaItems.push(`Time: ${node.estimatedDuration} min`);
    if (node.difficultyLevel) metaItems.push(`Difficulty: ${node.difficultyLevel}`);
    if (node.taxonomyLevel) metaItems.push(`Taxonomy: ${node.taxonomyLevel}`);
    
    if (metaItems.length > 0) {
      const metaInfo = document.createElement('p');
      metaInfo.className = 'meta-info';
      metaInfo.textContent = metaItems.join(' | ');
      nodeContainer.appendChild(metaInfo);
    }
    
    // Standards
    if (options.includeStandards && node.standardIds && node.standardIds.length > 0) {
      const standards = document.createElement('p');
      standards.className = 'standards';
      standards.textContent = `Standards: ${node.standardIds.join(', ')}`;
      nodeContainer.appendChild(standards);
    }
    
    // Recursively add children
    node.children.forEach(child => {
      nodeContainer.appendChild(renderNodeAsHtml(child, level + 1));
    });
    
    return nodeContainer;
  };
  
  // Add all nodes
  outline.rootNodes.forEach(node => {
    htmlContent.appendChild(renderNodeAsHtml(node, 0));
  });
  
  onProgress?.(0.6);
  
  // Add references if requested
  if (options.includeReferences && outline.references && outline.references.length > 0) {
    const referencesTitle = document.createElement('h2');
    referencesTitle.textContent = 'References';
    htmlContent.appendChild(referencesTitle);
    
    const referencesList = document.createElement('ol');
    outline.references.forEach(ref => {
      const refItem = document.createElement('li');
      refItem.innerHTML = `<strong>${ref.title}</strong>${ref.url ? ` - <a href="${ref.url}">${ref.url}</a>` : ''}`;
      
      if (ref.notes) {
        const notes = document.createElement('p');
        notes.textContent = `Note: ${ref.notes}`;
        refItem.appendChild(notes);
      }
      
      referencesList.appendChild(refItem);
    });
    
    htmlContent.appendChild(referencesList);
  }
  
  onProgress?.(0.8);
  
  // In a real implementation, we would send this HTML to a backend service that
  // would convert it to DOCX using a library like docx-js, mammoth, etc.
  // For this mock-up, we'll encode the HTML and return it as a data URL
  
  const htmlString = htmlContent.outerHTML;
  const blob = new Blob([htmlString], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  
  onProgress?.(1);
  
  return {
    url,
    filename: `${outline.title}.docx`
  };
};

// HTML Export Function
export const exportToHTML = async (
  outline: Outline, 
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<{ url: string; filename: string }> => {
  onProgress?.(0.2);
  
  // Create a styled HTML document
  const htmlDoc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${outline.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          line-height: 1.5;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        h1 {
          color: #2563eb;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        h2, h3, h4, h5, h6 {
          color: #1e40af;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .outline-node {
          margin-bottom: 1rem;
        }
        .meta-info {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.5rem;
        }
        .standards {
          font-size: 0.875rem;
          color: #4b5563;
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          display: inline-block;
        }
        .references {
          margin-top: 2rem;
          border-top: 2px solid #e5e7eb;
          padding-top: 1rem;
        }
        .reference-item {
          margin-bottom: 0.75rem;
        }
        .reference-notes {
          font-size: 0.875rem;
          font-style: italic;
          color: #6b7280;
        }
        .toc {
          margin: 2rem 0;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
        }
        .toc h2 {
          margin-top: 0;
        }
        .toc ol {
          padding-left: 1.5rem;
        }
        .toc li {
          margin-bottom: 0.5rem;
        }
      </style>
    </head>
    <body>
      <h1>${outline.title}</h1>
      ${outline.description ? `<p>${outline.description}</p>` : ''}
  `;
  
  onProgress?.(0.4);
  
  // Add table of contents if requested
  let tocHtml = '';
  if (options.includeTableOfContents) {
    tocHtml = `
      <div class="toc">
        <h2>Table of Contents</h2>
        <ol>
    `;
    
    // Helper function to create TOC items
    const createTocItem = (node: OutlineNode, level: number) => {
      let item = `<li><a href="#node-${node.id}">${node.title}</a>`;
      
      if (node.children.length > 0) {
        item += `<ol style="margin-left: ${level * 10}px;">`;
        node.children.forEach(child => {
          item += createTocItem(child, level + 1);
        });
        item += `</ol>`;
      }
      
      item += `</li>`;
      return item;
    };
    
    outline.rootNodes.forEach(node => {
      tocHtml += createTocItem(node, 1);
    });
    
    tocHtml += `
        </ol>
      </div>
    `;
  }
  
  onProgress?.(0.5);
  
  // Helper function to render a node and its children
  const renderNodeHtml = (node: OutlineNode, level: number) => {
    let nodeHtml = `
      <div class="outline-node" id="node-${node.id}">
        <h${Math.min(level + 2, 6)}>${node.title}</h${Math.min(level + 2, 6)}>
        ${node.description ? `<p>${node.description}</p>` : ''}
    `;
    
    // Add meta information
    const metaItems = [];
    if (options.includeWordCounts) metaItems.push(`Words: ${node.estimatedWordCount}`);
    if (options.includeTimeEstimates) metaItems.push(`Time: ${node.estimatedDuration} min`);
    if (node.difficultyLevel) metaItems.push(`Difficulty: ${node.difficultyLevel}`);
    if (node.taxonomyLevel) metaItems.push(`Taxonomy: ${node.taxonomyLevel}`);
    
    if (metaItems.length > 0) {
      nodeHtml += `<p class="meta-info">${metaItems.join(' | ')}</p>`;
    }
    
    // Add standards
    if (options.includeStandards && node.standardIds && node.standardIds.length > 0) {
      nodeHtml += `<p class="standards">Standards: ${node.standardIds.join(', ')}</p>`;
    }
    
    // Recursively add children
    node.children.forEach(child => {
      nodeHtml += renderNodeHtml(child, level + 1);
    });
    
    nodeHtml += `</div>`;
    return nodeHtml;
  };
  
  // Add all nodes
  let nodesHtml = '';
  outline.rootNodes.forEach(node => {
    nodesHtml += renderNodeHtml(node, 1);
  });
  
  onProgress?.(0.7);
  
  // Add references if requested
  let referencesHtml = '';
  if (options.includeReferences && outline.references && outline.references.length > 0) {
    referencesHtml = `
      <div class="references">
        <h2>References</h2>
        <ol>
    `;
    
    outline.references.forEach(ref => {
      referencesHtml += `
        <li class="reference-item">
          <strong>${ref.title}</strong>
          ${ref.url ? ` - <a href="${ref.url}" target="_blank">${ref.url}</a>` : ''}
          ${ref.notes ? `<p class="reference-notes">Note: ${ref.notes}</p>` : ''}
        </li>
      `;
    });
    
    referencesHtml += `
        </ol>
      </div>
    `;
  }
  
  onProgress?.(0.9);
  
  // Close the HTML document
  const htmlClose = `
    </body>
    </html>
  `;
  
  // Combine all the HTML parts
  const fullHtml = htmlDoc + tocHtml + nodesHtml + referencesHtml + htmlClose;
  
  // Create and return a blob URL for the HTML document
  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  onProgress?.(1);
  
  return {
    url,
    filename: `${outline.title}.html`
  };
};

// Markdown Export Function
export const exportToMarkdown = async (
  outline: Outline, 
  options: ExportOptions,
  onProgress?: (progress: number) => void
): Promise<{ url: string; filename: string }> => {
  onProgress?.(0.2);
  
  // Create the Markdown content
  let markdownContent = `# ${outline.title}\n\n`;
  
  if (outline.description) {
    markdownContent += `${outline.description}\n\n`;
  }
  
  onProgress?.(0.4);
  
  // Add table of contents if requested
  if (options.includeTableOfContents) {
    markdownContent += `## Table of Contents\n\n`;
    
    // Helper function to create TOC items
    const createTocItem = (node: OutlineNode, level: number) => {
      let indent = '  '.repeat(level - 1);
      let item = `${indent}- [${node.title}](#${node.id})\n`;
      
      node.children.forEach(child => {
        item += createTocItem(child, level + 1);
      });
      
      return item;
    };
    
    outline.rootNodes.forEach(node => {
      markdownContent += createTocItem(node, 1);
    });
    
    markdownContent += `\n`;
  }
  
  onProgress?.(0.6);
  
  // Helper function to render a node and its children
  const renderNodeMarkdown = (node: OutlineNode, level: number) => {
    // Create heading with the appropriate number of #
    let nodeMarkdown = `${'#'.repeat(level + 1)} ${node.title} {#${node.id}}\n\n`;
    
    if (node.description) {
      nodeMarkdown += `${node.description}\n\n`;
    }
    
    // Add meta information
    const metaItems = [];
    if (options.includeWordCounts) metaItems.push(`Words: ${node.estimatedWordCount}`);
    if (options.includeTimeEstimates) metaItems.push(`Time: ${node.estimatedDuration} min`);
    if (node.difficultyLevel) metaItems.push(`Difficulty: ${node.difficultyLevel}`);
    if (node.taxonomyLevel) metaItems.push(`Taxonomy: ${node.taxonomyLevel}`);
    
    if (metaItems.length > 0) {
      nodeMarkdown += `*${metaItems.join(' | ')}*\n\n`;
    }
    
    // Add standards
    if (options.includeStandards && node.standardIds && node.standardIds.length > 0) {
      nodeMarkdown += `**Standards:** ${node.standardIds.join(', ')}\n\n`;
    }
    
    // Recursively add children
    node.children.forEach(child => {
      nodeMarkdown += renderNodeMarkdown(child, level + 1);
    });
    
    return nodeMarkdown;
  };
  
  // Add all nodes
  outline.rootNodes.forEach(node => {
    markdownContent += renderNodeMarkdown(node, 1);
  });
  
  onProgress?.(0.8);
  
  // Add references if requested
  if (options.includeReferences && outline.references && outline.references.length > 0) {
    markdownContent += `## References\n\n`;
    
    outline.references.forEach((ref, index) => {
      markdownContent += `${index + 1}. **${ref.title}**${ref.url ? ` - [${ref.url}](${ref.url})` : ''}\n`;
      
      if (ref.notes) {
        markdownContent += `   *Note: ${ref.notes}*\n`;
      }
      
      markdownContent += '\n';
    });
  }
  
  onProgress?.(0.9);
  
  // Create and return a blob URL for the markdown document
  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  onProgress?.(1);
  
  return {
    url,
    filename: `${outline.title}.md`
  };
};
