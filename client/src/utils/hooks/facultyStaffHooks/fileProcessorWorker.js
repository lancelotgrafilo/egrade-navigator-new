import * as XLSX from 'xlsx';

self.onmessage = function(event) {
  console.log('Web Worker: Starting file processing');
  const file = event.data;
  const reader = new FileReader();

  reader.onload = function(event) {
    console.log('Web Worker: File read successfully');
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Convert sheet to JSON to access rows as objects
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const semester = rows[11][15]; // Adjust the index for your headers
      const academic_year = rows[12][15];
      const subjectCode = rows[14][15];
      const subjectTitle = rows[15][15];
      const units = rows[18][17];

      const students = [];
      let keepReading = true;
      
      // Assuming row index starts at 23 (zero-based)
      for (let rowIndex = 23; rowIndex < rows.length && keepReading; rowIndex++) {
        const row = rows[rowIndex];

        // Join all cells in the row to form a single string
        const rowString = row.join(' ');

        if (rowString.includes("***Nothing Follows***")) {
          console.log('Web Worker: Detected ***Nothing Follows*** marker');
          keepReading = false;
          break;
        }

        const lastName = row[1] || '';
        const firstName = row[3] || '';
        const middleInitial = row[4] || '';
        const courseYearSection = row[5] || '';
        const midterm = row[8] || '';
        const final = row[11] || '';
        const finalRating = row[14] || '';

        if (!lastName || lastName === 'FEMALE') {
          continue;
        }

        const course = courseYearSection.split(' ')[0];
        const yearSection = courseYearSection.replace(course, '').trim();
        const year = yearSection.match(/\d+/) ? yearSection.match(/\d+/)[0] : '';
        const section = yearSection.replace(year, '');

        const student = {
          lastName,
          firstName,
          middleInitial,
          course,
          year,
          section,
          midterm,
          final,
          finalRating
        };

        students.push(student);
        console.log(`Web Worker: Processing student at row ${rowIndex}`);
        console.log('Web Worker: Student Data:', student);
      }

      console.log('Web Worker: Finished processing file');
      console.log('Web Worker: All student data:', students);
      self.postMessage({ semester, academic_year, subjectCode, subjectTitle, units, students });
    } catch (error) {
      console.error('Web Worker: Error processing file', error);
      self.postMessage({ error: 'Failed to process the file. Please ensure it is in the correct format.' });
    }
  };

  reader.readAsArrayBuffer(file);
};
