import { useState, useRef, lazy, Suspense } from "react";
import { jsPDF } from "jspdf";

const JoditEditor = lazy(() => import("jodit-react"));

function App() {
  const editor = useRef(null);
  const [text, setText] = useState("");

  const parseHtmlContent = (htmlContent) => {
    const temp = document.createElement("div");
    temp.innerHTML = htmlContent;
    const elements = [];

    const collectText = (node) => {
      let text = "";
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          text += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (
            ["strong", "b", "em", "i", "span"].includes(
              child.tagName.toLowerCase()
            )
          ) {
            text += collectText(child);
          } else {
            text += " " + collectText(child) + " ";
          }
        }
      });
      return text.trim();
    };

    const parseNode = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        switch (node.tagName.toLowerCase()) {
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            elements.push({
              type: "heading",
              content: collectText(node),
              level: Number.parseInt(node.tagName[1]),
            });
            break;
          case "ul":
            elements.push({
              type: "ulist", 
              items: Array.from(node.children).map((li) => collectText(li)),
            });
            break;
          case "ol":
            elements.push({
              type: "olist", 
              items: Array.from(node.children).map((li) => collectText(li)),
            });
            break;
          case "p":
          default:
            const text = collectText(node);
            if (text) elements.push({ type: "text", content: text });
        }
      }
    };

    Array.from(temp.childNodes).forEach(parseNode);
    return elements;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    const lineHeight = 7;
    let y = margin + 10;

    const addNewPage = () => {
      doc.addPage();
      return margin + 10;
    };

    const elements = parseHtmlContent(text);

    elements.forEach((element) => {
      if (element.type === "heading") {
        if (y + lineHeight > pageHeight - margin) y = addNewPage();
        doc.setFontSize(16 - element.level).setFont("helvetica", "bold");
        const lines = doc.splitTextToSize(element.content, contentWidth);
        lines.forEach(line => {
          if (y + lineHeight > pageHeight - margin) y = addNewPage();
          doc.text(line, margin, y);
          y += lineHeight;
        });
      } else if (element.type === "ulist") {
        element.items.forEach((item) => {
          const lines = doc.splitTextToSize(item, contentWidth - 5);
          lines.forEach((line, idx) => {
            if (y + lineHeight > pageHeight - margin) y = addNewPage();
            doc.text(idx === 0 ? `• ${line}` : `  ${line}`, margin + 5, y);
            y += lineHeight;
          });
        });
      } else if (element.type === "olist") {
        element.items.forEach((item, index) => {
          const lines = doc.splitTextToSize(item, contentWidth - 5);
          lines.forEach((line, idx) => {
            if (y + lineHeight > pageHeight - margin) y = addNewPage();
            doc.text(idx === 0 ? `${index + 1}. ${line}` : `   ${line}`, margin + 5, y);
            y += lineHeight;
          });
        });
      } else if (element.type === "text") {
        const lines = doc.splitTextToSize(element.content, contentWidth);
        lines.forEach((line) => {
          if (y + lineHeight > pageHeight - margin) y = addNewPage();
          doc.text(line, margin, y);
          y += lineHeight;
        });
      }
    });

    doc.save("document.pdf");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Fill the form</h1>
      <Suspense fallback={<p>Loading editor...</p>}>
        <JoditEditor
          ref={editor}
          value={text}
          onBlur={(newText) => setText(newText)}
          config={{ readonly: false, placeholder: "Start typing here..." }}
        />
      </Suspense>
      <button 
        style={{ 
          marginTop: "20px", 
          padding: "10px 20px", 
          backgroundColor: "#007bff", 
          color: "white", 
          border: "none", 
          borderRadius: "4px",
          cursor: "pointer"
        }} 
        onClick={downloadPDF}
      >
        Download PDF
      </button>
    </div>
  );
}

export default App;