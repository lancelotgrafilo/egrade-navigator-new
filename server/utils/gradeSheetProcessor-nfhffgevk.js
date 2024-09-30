const XLSX = require('xlsx');
const fs = require('fs');

// Function to process the grade sheet
exports.processGradeSheet = async (filePath) => {
    const data = fs.readFileSync(filePath);
    const workbook = XLSX.read(data, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    const getValue = (cellAddress) => (worksheet[cellAddress] ? worksheet[cellAddress].v : '');

    const semester = getValue('P12');
    const academicYear = getValue('P13');
    const subjectCode = getValue('P15');
    const subjectTitle = getValue('P16');
    const units = getValue('R19');

    const students = [];
    let rowIndex = 24;
    let keepReading = true;

    while (keepReading) {
        const lastName = getValue(`B${rowIndex}`);
        const firstName = getValue(`D${rowIndex}`);
        const middleInitial = getValue(`E${rowIndex}`);
        const fullRow = `${lastName} ${firstName} ${middleInitial}`;

        if (fullRow.includes("***Nothing Follows***")) {
            keepReading = false;
            break;
        }

        if (!lastName || lastName === 'FEMALE' || lastName === '') {
            rowIndex++;
            continue;
        }

        const courseYearSection = getValue(`F${rowIndex - 1}`);
        const midterm = getValue(`I${rowIndex - 1}`);
        const final = getValue(`L${rowIndex - 1}`);
        const finalRating = getValue(`O${rowIndex - 1}`);

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
        rowIndex++;
    }

    return { semester, academicYear, subjectCode, subjectTitle, units, students };
};
