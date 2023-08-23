const fs = require('fs');
const path = require('path');

const savedSubjectsFilePath = 'saved_subjects.json';
const cleanedFilePath = 'clean_subject.json';

function cleanDuplicates(subjects) {
    const uniqueSubjects = [...new Set(subjects)];
    return uniqueSubjects;
}

async function cleanAndSave() {
    try {
        if (fs.existsSync(savedSubjectsFilePath)) {
            const existingSubjects = JSON.parse(fs.readFileSync(savedSubjectsFilePath));
            const cleanedSubjects = cleanDuplicates(existingSubjects);
            fs.writeFileSync(cleanedFilePath, JSON.stringify(cleanedSubjects, null, 2));
            console.log('Duplicates cleaned and saved to clean_subject.json.');
        } else {
            console.log('No file found. Duplicates not cleaned.');
        }
    } catch (error) {
        console.error('Error cleaning duplicates:', error);
    }
}

cleanAndSave();