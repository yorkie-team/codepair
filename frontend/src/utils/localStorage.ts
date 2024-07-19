const CURRENT_DOCUMENT_NAME = "CURRENT_DOCUMENT_NAME";

const getDocumentName = () => {
    return localStorage.getItem(CURRENT_DOCUMENT_NAME);
}

const setDocumentName = (name: string) => {
    localStorage.setItem(CURRENT_DOCUMENT_NAME, name);
}

const deleteDocumentName = () => {
    localStorage.removeItem(CURRENT_DOCUMENT_NAME);
}

const documentNameStorage = {
    getDocumentName,
    setDocumentName,
    deleteDocumentName,
};

export { documentNameStorage };

