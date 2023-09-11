const fs = require('fs');
const path = require('path');

const savedSubjectsFilePath = '../ffbdata/saved_subjects.json';
const cleanedFilePath = '../ffbdata/clean_subject.json';

function cleanDuplicates(subjects) {
    const uniqueSubjects = [...new Set(subjects)];
    return uniqueSubjects;
}

async function cleanAndSave() {
    try {
        if (fs.existsSync(savedSubjectsFilePath)) {
            const existingSubjects = JSON.parse(fs.readFileSync(savedSubjectsFilePath));
            const cleanedSubjects = cleanDuplicates(existingSubjects);
            fs.appendFileSync(cleanedFilePath, JSON.stringify(cleanedSubjects, null, 2));
            console.log('Duplicates cleaned and saved to clean_subject.json.');
        } else {
            console.log('No file found. Duplicates not cleaned.');
        }
    } catch (error) {
        console.error('Error cleaning duplicates:', error);
    }
}

cleanAndSave();
