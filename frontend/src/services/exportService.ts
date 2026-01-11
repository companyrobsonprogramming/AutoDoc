import { FinalDocumentation } from '../types/domain';

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportAsMarkdown = (doc: FinalDocumentation) => {
  const blob = new Blob([doc.contentMarkdown], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `documentacao-session-${doc.sessionId}.md`);
};

export const exportAsPdf = (doc: FinalDocumentation) => {
  const header = `Documentação gerada automaticamente - Sessão ${doc.sessionId}\n\n`;
  const content = header + doc.contentMarkdown;
  const blob = new Blob([content], { type: 'application/pdf' });
  triggerDownload(blob, `documentacao-session-${doc.sessionId}.pdf`);
};

export const exportAsDocx = (doc: FinalDocumentation) => {
  const blob = new Blob([doc.contentMarkdown], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
  triggerDownload(blob, `documentacao-session-${doc.sessionId}.docx`);
};
