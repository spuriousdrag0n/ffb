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

            let existingCleanedData = [];
            if (fs.existsSync(cleanedFilePath)) {
                existingCleanedData = JSON.parse(fs.readFileSync(cleanedFilePath));
            }

            const updatedCleanedData = [...existingCleanedData, ...cleanedSubjects];

            fs.writeFileSync(cleanedFilePath, JSON.stringify(updatedCleanedData, null, 2));
            console.log('Duplicates cleaned and added to clean_subject.json.');
        } else {
            console.log('No file found. Duplicates not cleaned.');
        }
    } catch (error) {
        console.error('Error cleaning duplicates:', error);
    }
}

cleanAndSave();

