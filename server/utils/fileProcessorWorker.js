const { workerData, parentPort } = require('worker_threads');
const XLSX = require('xlsx');

const processFile = (fileBuffer) => {
  try {
    // Log buffer size for debugging
    console.log('Received file buffer size:', fileBuffer.length);

    // Read the file buffer directly
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    const sheet = workbook.Sheets[sheetNames[0]];

    if (!sheet) {
      throw new Error('No sheet found in the file.');
    }

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length < 65) { // Ensure enough rows are present for dean (row 64)
      throw new Error('File data is missing expected rows.');
    }

    const semester = rows[11]?.[15] || '';
    const academic_year = rows[12]?.[15] || '';
    const subject_code = rows[14]?.[15] || '';
    const subject_title = rows[15]?.[15] || '';
    const units = rows[18]?.[17] || '';

    // Extract instructor, program chair, and dean based on the new coordinates
    const instructor_name = rows[58]?.[1] || ''; // B59 (index 58 since array is zero-based)
    const program_chair = rows[58]?.[14] || '';  // O59 (index 14 for column O)
    const dean = rows[63]?.[5] || '';            // F64 (index 63 for row 64 and 5 for column F)

    // Validate that the critical fields are not empty
    if (!semester || !academic_year || !subject_code || !subject_title || !units || !instructor_name || !program_chair || !dean) {
      throw new Error('Critical data is missing. Please ensure semester, academic year, subject code, subject title, units, instructor name, program chair, and dean fields are filled.');
    }

    let course = '';
    let year = '';
    let section = '';
    const students = [];
    let keepReading = true;

    for (let rowIndex = 23; rowIndex < rows.length && keepReading; rowIndex++) {
      const row = rows[rowIndex];

      if (row && row.join(' ').includes("***Nothing Follows***")) {
        keepReading = false;
        break;
      }

      const last_name = row[1] || '';
      const first_name = row[3] || '';
      const middle_initial = row[4] || '';
      const course_year_section = row[5] || '';
      const midterm_grade = row[8] || '';
      const finalterm_grade = row[11] || '';
      const FINAL_GRADE = row[14] || '';

      if (!last_name || last_name === 'FEMALE') {
        continue;
      }

      course = course_year_section.split(' ')[0];
      const year_section = course_year_section.replace(course, '').trim();
      year = year_section.match(/\d+/) ? year_section.match(/\d+/)[0] : '';
      section = year_section.replace(year, '');

      students.push({
        last_name,
        first_name,
        middle_initial,
        course,
        year,
        section,
        midterm_grade,
        finalterm_grade,
        FINAL_GRADE
      });
    }

    // Return the extracted data, including instructor, program chair, and dean
    return { 
      semester, 
      academic_year, 
      subject_code, 
      subject_title, 
      units, 
      instructor_name,  // New field
      program_chair,    // New field
      dean,             // New field
      students, 
      course, 
      year, 
      section 
    };
  } catch (error) {
    throw new Error(`Error processing file: ${error.message}`);
  }
};

const fileBuffer = workerData.fileBuffer;

// Debug log to check if buffer is correctly received
console.log('fileProcessorWorker.js : Worker received file buffer:', fileBuffer);

try {
  const result = processFile(fileBuffer);
  parentPort.postMessage(result);
} catch (error) {
  parentPort.postMessage({ error: error.message });
}
