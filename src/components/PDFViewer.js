import React from 'react';

function PDFViewer({ pdfUrl }) {
    return (
        <iframe
            src={pdfUrl}
            title="Recipe PDF"
            width="100%"
            height="600px"
            style={{ border: '1px solid #ccc', marginTop: '20px' }}
        />
    );
}

export default PDFViewer;
