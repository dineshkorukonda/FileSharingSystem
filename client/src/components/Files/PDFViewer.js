import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { downloadFile, getFileBlob } from '../../utils/fileUtils';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const PDFViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [pdfBlob, setPdfBlob] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoading(true);
        const blob = await getFileBlob(file);
        setPdfBlob(blob);
      } catch (err) {
        console.error('Failed to fetch PDF blob:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchPdf();
  }, [file]);

  if (error) {
    return (
      <div className="text-center py-8 space-y-3">
        <p className="font-medium">Unable to preview this PDF</p>
        <p className="text-sm text-base-content/70">{error.message || 'Download the file instead.'}</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => downloadFile(file)}>
          Download
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="join">
          <button type="button" className="btn btn-xs join-item" onClick={() => setPageNumber((p) => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>
            Prev
          </button>
          <span className="btn btn-xs join-item btn-disabled">
            {loading ? '...' : `${pageNumber} / ${numPages || 1}`}
          </span>
          <button
            type="button"
            className="btn btn-xs join-item"
            onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
            disabled={!numPages || pageNumber >= numPages}
          >
            Next
          </button>
        </div>
        <div className="join">
          <button type="button" className="btn btn-xs join-item" onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}>−</button>
          <span className="btn btn-xs join-item btn-disabled">{Math.round(scale * 100)}%</span>
          <button type="button" className="btn btn-xs join-item" onClick={() => setScale((s) => Math.min(s + 0.2, 2.5))}>+</button>
        </div>
        <button type="button" className="btn btn-xs" onClick={() => downloadFile(file)}>Download</button>
      </div>

      <div className="overflow-auto flex justify-center min-h-[320px] max-h-[60vh] bg-base-200 p-4">
        {loading && <p className="text-sm text-base-content/70">Loading PDF</p>}
        {pdfBlob && (
          <Document
            file={pdfBlob}
            onLoadSuccess={({ numPages: pages }) => {
              setNumPages(pages);
              setLoading(false);
            }}
            onLoadError={(err) => {
              console.error('Error loading PDF document:', err);
              setError(err);
              setLoading(false);
            }}
            loading={null}
          >
            <Page pageNumber={pageNumber} scale={scale} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
