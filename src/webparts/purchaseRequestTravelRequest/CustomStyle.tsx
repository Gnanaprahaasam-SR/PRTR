import { IComboBoxStyles, ITextFieldStyles, IToggleStyles, IIconStyles, IDetailsListStyles, IPeoplePickerItemSuggestionStyles } from '@fluentui/react';

export const comboBoxStyles: Partial<IComboBoxStyles> = {
    input: {
        selectors: {
            '&:focus .ms-ComboBox': {
                borderColor: '#021B79 !important',
            },
        },
    },
    root: {
        selectors: {
            '.ms-ComboBox': {
                borderColor: '#021B79 !important',
            },
            '&:focus .ms-ComboBox': {
                borderColor: '#021B79 !important',
            },
        },
    },
    callout: {
        minWidth: 150, // Set the width of the dropdown
    },
};

export const textFieldStyles: Partial<ITextFieldStyles> = {
    fieldGroup: {
        width: "100%",
        selectors: {
            '.ms-TextField-fieldGroup': {
                backgroundColor: '#FFFFFF !important',
            },

            '&:hover .ms-TextField-fieldGroup': {
                borderColor: '#021B79',
            },
            '&:focus .ms-TextField-fieldGroup': {
                borderColor: '#021B79',
            },
        },
    },
};

export const peoplePickerStyles: Partial<IPeoplePickerItemSuggestionStyles> = {
    root: {
        backgroundColor: 'white',
        borderColor: '#cccccc',
        border: '1px solid transparent',
        borderRadius: '5px',
        width: '100% !important',
        selectors: {        
            '&:hover, &:focus, &:active': {
                border: '2px solid #0078D4 !important',
            }
        },
        
    }
};

export const toggleStyles: Partial<IToggleStyles> = {

    pill: {
        root: {
            backgroundColor: '#0171DF !important', // Default background color
            selectors: {
                '&.ms-Toggle--checked': {
                    backgroundColor: '#0171DF !important', // Background color when checked
                },
            },
        }

    },
    thumb: {
        root: {
            backgroundColor: '#0171DF !important', // Default thumb color
            selectors: {
                '&.ms-Toggle--checked': {
                    backgroundColor: '#0171DF !important', // Thumb color when checked
                },
            }

        },
    },
};


export const iconButtonStyles: Partial<IIconStyles> = {
    root: {
        selectors: {
            '.ms-Button-icon': {
                color: '#2A3439',
            },
            '&:hover .ms-Button-icon': {
                color: '#2A3439',
            },
            '&:focus .ms-Button-icon': {
                color: '#2A3439',
            },
        },
    },
};

export const navExpendIcon: Partial<IIconStyles> = {
    root: {
        backgroundColor: 'transparent',
        selectors: {
            '.ms-Button-icon': {
                color: '#ffffff',
                backgroundColor: 'transparent',
            },
            '&:hover .ms-Button-icon': {
                color: '#021B79',
                backgroundColor: 'transparent',
            },


        },
    },
};



export const tableIconStyles: Partial<IIconStyles> = {
    root: {
        selectors: {
            '.ms-Button-icon': {
                color: '#ffffff',
            },
            '&:hover .ms-Button-icon': {
                color: '#021B79',
                background: 'transparent'
            },
            '&:focus .ms-Button-icon': {
                color: '#ffffff',
            },
        },
    },
};


export const detailsListStyles: Partial<IDetailsListStyles> = {
    root: {
        width: '100%',
        borderRadius: '10px',
    },
    headerWrapper: {
        selectors: {
            '.ms-DetailsHeader': {
                background: '#2A3439',
            },
            '.ms-DetailsHeader-cell': {
                borderBottom: 'none',
                backgroundColor: '#2A3439',
                color: '#ffffff',
                selectors: {
                    ':hover': {
                        background: '#2A3439',
                        cursor: 'default !important',
                        color: '#ffffff',
                    },
                    ':active': {
                        background: '#2A3439',
                        color: '#ffffff',
                    },
                    ':focus': {
                        background: '#2A3439',
                        color: '#ffffff',
                    },
                },
            },
        },
    },
    contentWrapper: {
        selectors: {
            '.ms-DetailsRow-cell': {
                backgroundColor: '#ffffff', // Default row background color
                color: 'black',
                borderBottom: '1px solid #ccc',
                selectors: {
                    ':hover': {
                        backgroundColor: '#ffffff', // Keeps row background white on hover
                        color: 'black',
                    },
                },
            },
            // Group Header styles
            '.ms-GroupHeader': {
                backgroundColor: '#f2f2f2', // Light grey for the group header background
                color: 'black',
                selectors: {
                    ':hover': {
                        backgroundColor: '#e6e6e6', // Slightly darker grey on hover
                    },
                },
            },
            // First group level
            '.ms-GroupHeader:nth-child(2n) .ms-DetailsRow-cell': {
                backgroundColor: '#e1f5fe', // Light blue for group rows
            },
            // Second group level
            '.ms-GroupHeader:nth-child(2n+1) .ms-DetailsRow-cell': {
                backgroundColor: '#e8f5e9', // Light green for group rows
            },
        },
    },
};
