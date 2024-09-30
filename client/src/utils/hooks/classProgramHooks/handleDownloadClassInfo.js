export const handleDownloadClassInfo = () => {
  let csvContent = 'department,subject_code,subject_title,yearLevel,section,semester,academic_year\n';

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'class_program_information_format.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
