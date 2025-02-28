// import React, { useEffect, useState } from 'react';
// import {
//   DetailsList,
//   DetailsListLayoutMode,
//   SelectionMode,
//   IColumn,
//   TextField,
//   IconButton,
//   IContextualMenuProps,
//   ContextualMenu,
//   SearchBox,
// } from '@fluentui/react';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
// import { BsFileEarmarkSpreadsheetFill } from "react-icons/bs";
// import { HiPlusCircle } from "react-icons/hi";
// import { tableIconStyles, detailsListStyles} from '../../CustomStyle';
// import Styles from '../PurchaseRequestTravelRequest.module.scss';
// import { IDepartmentProps } from './IDepartmentProps';
// import { PurchaseRequestTravelRequestService } from '../../Service/PurchaseRequestTravelRequest';
// // import ConfirmationDialog from '../AlertModel/ConfirmationDialog';
// import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
// import { FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
// import {
//   Dialog,
//   DialogType,
// } from '@fluentui/react';


// interface Department {
//   id: number;
//   department: string;
//   isActive: boolean;
// }

// interface Division {
//   id: number;
//   name: string;
// }



// const DepartmentTable: React.FC<IDepartmentProps> = (props) => {
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [division, setDivision] = useState<Division[]>([]);
//   const [isEditable, setIsEditable] = useState<{ [key: number]: boolean }>({});
//   const [filterText, setFilterText] = useState<string>('');
//   const [sortedDepartments, setSortedDepartments] = useState<Department[]>([]);
//   const [exportData, setExportData] = useState<Department[]>([]);
//   const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: 'id', direction: 'ascending' });
//   const [filterDropdownVisible, setFilterDropdownVisible] = useState<boolean>(false);
//   const [filterDropdownTarget, setFilterDropdownTarget] = useState<HTMLElement | null>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [addingDepartment, setAddingDepartment] = useState<boolean>(false);
//   // const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
//   // const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [pageSize, setPageSize] = useState<number>(10);
//   const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
//   const [dialogMessage, setDialogMessage] = useState<string>('');
//   const [dialogTitle, setDialogTitle] = useState<string>('');
//   const closeDialog = (): void => {
//     setIsDialogOpen(false);
//     setDialogMessage('');
//     setDialogTitle('');
//   }



//   const fetchDepartments = async (): Promise<void> => {
//     const service = new PurchaseRequestTravelRequestService(props.context);
//     setLoading(true);
//     const ActiveStatus = true;
//     try {
//       const data = await service.getPRTRDepartment(ActiveStatus);
//       const formattedDepartments = data.map((item, index) => ({
//         id: item.ID,
//         department: item?.Department,
//         isActive: item?.IsActive,
//       }));
//       setDepartments(formattedDepartments);
//       setSortedDepartments(formattedDepartments);
//       setExportData(formattedDepartments);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching departments:', error);
//       setLoading(false);
//     }
//   };



//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await fetchDepartments();
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, [props.context]);

//   const handlePageChange = (newPage: number): void => {
//     if (newPage > 0 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };


//   const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
//     setPageSize(Number(event.target.value));
//     setCurrentPage(1);
//   };


//   const paginatedDepartments = React.useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     const end = start + pageSize;
//     return sortedDepartments.slice(start, end);
//   }, [currentPage, pageSize, sortedDepartments]);

//   const totalPages = Math.ceil(sortedDepartments.length / pageSize);


//   const renderPaginationControls = (): JSX.Element => {
//     return (
//       <div className="d-flex justify-content-between align-items-center mt-3">
//         <div className="d-flex flex-row align-items-center">
//           <label htmlFor="pageSizeSelect" className='text-nowrap'>Rows Per Page &nbsp;</label>
//           <select id="pageSizeSelect" value={pageSize} onChange={handlePageSizeChange} className={` ${Styles.inputStyle} text-nowrap`}>
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={25}>25</option>
//             <option value={50}>50</option>
//           </select>
//         </div>
//         <div className='d-flex align-items-center gap-1'>
//           <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`${Styles.paginationButton}`}>
//             <FiArrowLeftCircle size={20} />
//           </button>
//           <span className="mx-2">
//             Page {currentPage} of {totalPages}
//           </span>
//           <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`${Styles.paginationButton}`}>
//             <FiArrowRightCircle size={20} />
//           </button>
//         </div>
//       </div>
//     );
//   };

//   const toggleEditRow = (id: number): void => {
//     setIsEditable(prevState => ({ ...prevState, [id]: !prevState[id] }));
//   };


//   const handleRowChange = (id: number, updates: { [key: string]: any }): void => {
//     const updatedDepartments = departments.map(department =>
//       department.id === id ? { ...department, ...updates } : department
//     );
//     setDepartments(updatedDepartments);

//     const updatedSortedDepartments = sortedDepartments.map(department =>
//       department.id === id ? { ...department, ...updates } : department
//     );
//     setSortedDepartments(updatedSortedDepartments);
//   };


//   const updateDepartmentData = async (id: number, updatedDepartment: Department): Promise<void> => {
//     const service = new PurchaseRequestTravelRequestService(props.context);
//     setLoading(true);

//     const updatedDepartmentData = {
//       Department: updatedDepartment.department,
//       IsActive: updatedDepartment.isActive,
//     };

//     try {

//       const response = await service.updatePRTRDepartment(id, updatedDepartmentData);

//       // Check if the service returned a message about an existing department
//       if (response.message === "Department with this name already exists under the selected division.") {
//         setLoading(false);
//         setIsDialogOpen(true);
//         setDialogMessage('A department with same name already exists. Please choose a different name.');

//         setDialogTitle("Error");
//       } else {
//         // If successfully added
//         setLoading(false);
//         setIsDialogOpen(true);
//         setDialogMessage('Department updated successfully');
//         setDialogTitle("Success");
//       }

//       // Attempt to update the department

//       // Refresh the department list
//       fetchDepartments();
//     } catch (error) {
//       if (error.message === 'Department with this name already exists under the selected division.') {
//         // Handle the Error case
//         setLoading(false);
//         setIsDialogOpen(true);
//         setDialogMessage('Department with this name already exists under the selected division.');

//         setDialogTitle("Error");
//       } else {
//         // Log any other errors
//         console.error('Error updating Department:', error);
//         setLoading(false);
//       }
//     }
//   };




//   const addNewDepartmentToService = async (newDepartment: Department): Promise<void> => {
//     const service = new PurchaseRequestTravelRequestService(props.context);
//     const newItemData = {
//       Department: newDepartment.department,
//       IsActive: newDepartment.isActive,
//     };
//     setLoading(true);

//     try {
//       const response = await service.addPOIMDepartment(newItemData);

//       // Check if the service returned a message about an existing department
//       if (response.message === "Department with this name already exists under the selected division.") {
//         setLoading(false);
//         setIsDialogOpen(true);
//         setDialogMessage('A department with same name already exists in the selected division. Please choose a different name.')
//         setDialogTitle("Error");
//       } else {
//         // If successfully added
//         setLoading(false);
//         setIsDialogOpen(true);
//         setDialogMessage('Department added successfully');
//         setDialogTitle("Success");
//       }

//       fetchDepartments();

//     } catch (error) {
//       console.error('Error adding new Department:', error);
//       setLoading(false);
//     }
//   };

//   const saveRow = async (id: number): Promise<void> => {
//     setIsEditable(prevState => ({ ...prevState, [id]: false }));

//     const updatedDepartment = departments.find(department => department.id === id);

//     if (updatedDepartment) {
//       if (id === 0) {
//         await addNewDepartmentToService(updatedDepartment);
//       } else {
//         await updateDepartmentData(id, updatedDepartment);
//       }
//     }
//     setAddingDepartment(false);
//   };

//   const cancelEditRow = (id: number): void => {
//     if (id === 0) {
//       setDepartments(prevDepartments => prevDepartments.filter(department => department.id !== 0));
//       setSortedDepartments(prevSortedDepartments => prevSortedDepartments.filter(department => department.id !== 0));
//       setAddingDepartment(false);
//     } else {
//       toggleEditRow(id);
//     }
//   };

//   // const deleteRow = (department: Department): void => {
//   //   setDepartmentToDelete(department);
//   //   setDeleteDialogVisible(true);
//   // };

//   // const confirmDelete = async (): Promise<void> => {
//   //   if (departmentToDelete) {
//   //     const service = new POandAssetManagementService(props.context);
//   //     setLoading(true);

//   //     try {
//   //       await service.deletePOIMDepartment(departmentToDelete.id);
//   //       setLoading(false);

//   //       fetchDepartments();
//   //     } catch (error) {
//   //       console.error('Error deleting department:', error);
//   //       setLoading(false);

//   //     }
//   //     setDeleteDialogVisible(false);
//   //     setDepartmentToDelete(null);
//   //   }
//   // };

//   const addNewDepartment = (): void => {
//     if (addingDepartment) return;
//     const newItem: Department = { id: 0, department: '', isActive: true };
//     setDepartments([newItem, ...departments]);
//     setSortedDepartments([newItem, ...sortedDepartments]);
//     setIsEditable(prevState => ({ ...prevState, [newItem.id]: true }));
//     setAddingDepartment(true);
//   };

//   const exportToExcel = (): void => {
//     const dataToExport = exportData.map(department => ({
//       "Department": department.department,
//       "Is Active?": department.isActive ? 'Yes' : 'No',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(dataToExport);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');
//     const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//     const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
//     saveAs(data, `POIMDepartments_${new Date().getTime()}${EXCEL_EXTENSION}`);
//   };

//   const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
//   const EXCEL_EXTENSION = '.xlsx';

//   const handleColumnSort = (columnKey: string): void => {
//     // Exclude 'divisionId' from sorting
//     if (columnKey === 'divisionId') return;

//     const newSortConfig = { ...sortConfig };
//     if (newSortConfig.key === columnKey) {
//       newSortConfig.direction = newSortConfig.direction === 'ascending' ? 'descending' : 'ascending';
//     } else {
//       newSortConfig.key = columnKey;
//       newSortConfig.direction = 'ascending';
//     }
//     setSortConfig(newSortConfig);

//     const sortedData = [...sortedDepartments].sort((a, b) => {
//       const key = newSortConfig.key as keyof Department;

//       // Ensure values are defined and comparable (either string or number)
//       const valueA = a[key];
//       const valueB = b[key];

//       if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
//         if (valueA === valueB) return 0;
//         return (valueA === true ? 1 : -1) * (newSortConfig.direction === 'ascending' ? 1 : -1);
//       }

//       // Compare only if both values are defined and comparable
//       if (valueA != null && valueB != null && (typeof valueA === 'string' || typeof valueA === 'number')) {
//         if (valueA < valueB) {
//           return newSortConfig.direction === 'ascending' ? -1 : 1;
//         }
//         if (valueA > valueB) {
//           return newSortConfig.direction === 'ascending' ? 1 : -1;
//         }
//       }

//       return 0;
//     });

//     setSortedDepartments(sortedData);
//   };



//   const handleFilterChange = (newValue?: string): void => {
//     const filterText = (newValue || '').toLowerCase();
//     setFilterText(filterText);
//     setCurrentPage(1);

//     const filteredDepartments = departments.filter((department) =>
//       department.department.toLowerCase().includes(filterText)
//     );

//     setSortedDepartments(filteredDepartments);
//   };


//   const handleFilterIconClick = (ev: React.MouseEvent<HTMLElement>): void => {
//     setFilterDropdownVisible(!filterDropdownVisible);
//     setFilterDropdownTarget(ev.currentTarget);
//   };

//   const validateDepartmentName = (name: string): string => {
//     if (!name) {
//       return "Department Name is required.";
//     }
//     return "";
//   };

//   const validateDivisionName = (name: string): string => {
//     if (!name) {
//       return "Division Name is required.";
//     }
//     return "";
//   };

//   const columns: IColumn[] = [
//     {
//       key: 'sNo',
//       name: 'S.No',
//       fieldName: 'id',
//       maxWidth: 40,
//       onRender: (item, index, column) => {
//         const sortedIndex = sortedDepartments.findIndex(sortedItem => sortedItem.id === item.id);
//         return <span>{sortedIndex !== undefined ? sortedIndex + 1 : ''}</span>;
//       },
//       minWidth: 40
//     },
//     {
//       key: 'actions',
//       name: 'Actions',
//       fieldName: 'actions',
//       minWidth: 100,
//       maxWidth: 100,
//       flexGrow: 1,
//       onRender: (item: Department) => (
//         <div style={{ display: 'flex', gap: '5px' }}>
//           {isEditable[item.id] ? (
//             <>
//               <IconButton iconProps={{ iconName: 'Save' }}
//                 title="Save"
//                 ariaLabel="Save"
//                 onClick={() => saveRow(item.id)} className={`${Styles.iconButton}`}
//                 disabled={validateDepartmentName(item.department) !== "" } />
//               <IconButton iconProps={{ iconName: 'Cancel' }}
//                 title="Cancel"
//                 ariaLabel="Cancel"
//                 onClick={() => cancelEditRow(item.id)} className={`${Styles.iconButton}`} />
//             </>
//           ) : (
//             <>
//               <IconButton iconProps={{ iconName: 'Edit' }}
//                 title="Edit"
//                 ariaLabel="Edit"
//                 onClick={() => toggleEditRow(item.id)} className={`${Styles.iconButton}`} />
//               {/* <IconButton iconProps={{ iconName: 'Delete' }}
//                 title="Delete"
//                 ariaLabel="Delete"
//                 onClick={() => deleteRow(item)} styles={iconButtonStyles} /> */}
//             </>
//           )}
//         </div>
//       ),
//     },
   
//     {
//       key: 'name',
//       name: 'Department',
//       fieldName: 'name',
//       minWidth: 200,
//       maxWidth: 200,
//       flexGrow: 1,
//       onRender: (item: Department) => (
//         isEditable[item.id] ? (
//           <TextField
//             value={item.department}
//             onChange={(e, newValue) => handleRowChange(item.id, { name: newValue || '' })}
//             styles={{ root: { width: '100%' } }}
//             onGetErrorMessage={value => validateDepartmentName(value || '')}
//             validateOnLoad={false} // Do not show error message until user starts typing
//             deferredValidationTime={300}
//           />
//         ) : (
//           <span>{item.department}</span>
//         )
//       ),
//       onRenderHeader: (props) => (
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <span>{props?.column.name}</span>
//           <div style={{ display: 'flex', gap: '3px' }}>
//             <IconButton
//               iconProps={{ iconName: 'Filter' }}
//               onClick={handleFilterIconClick}
//               styles={tableIconStyles}
//             />
//             <IconButton
//               iconProps={{
//                 iconName: sortConfig.key === 'name' ? (sortConfig.direction === 'ascending' ? 'ChevronUp' : 'ChevronDown') : 'ChevronUp'
//               }}
//               onClick={() => handleColumnSort('name')}
//               className={`${Styles.tableIconButton}`}
//             />
//           </div>
//         </div>
//       ),
//     },
//     {
//       key: 'IsActive',
//       name: 'Is Active?',
//       fieldName: 'IsActive',
//       minWidth: 100,
//       flexGrow: 1,
//       onRender: (item: Department) => (
//         isEditable[item.id] ? (
//           // <Toggle
//           //   checked={item.isActive}
//           //   onChange={(e, newValue: boolean) => handleRowChange(item.id, { isActive: newValue ?? false })} // Using handleRowChange for toggle
//           //   styles={toggleStyles}
//           // />
//           <div className="form-check form-switch" style={{ fontSize: '1.5rem' }}>
//             <input
//               className="form-check-input"
//               type="checkbox"
//               id={`toggle-${item.id}`} // Unique ID for each toggle
//               checked={item.isActive}
//               onChange={(e) => handleRowChange(item.id, { isActive: e.target.checked ?? false })}
//               style={{ width: '2.5rem', height: '1.5rem' }}
//             />
//           </div>
//         ) : (
//           <span>{item.isActive ? "Yes" : "No"}</span>
//         )
//       ),
//       onRenderHeader: (props) => (
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <span>{props?.column.name}</span>
//           <div style={{ display: 'flex', gap: '3px' }}>
//             <IconButton
//               iconProps={{
//                 iconName: sortConfig.key === 'isActive' ? (sortConfig.direction === 'ascending' ? 'ChevronUp' : 'ChevronDown') : 'ChevronUp'
//               }}
//               onClick={() => handleColumnSort('isActive')}
//               className={`${Styles.tableIconButton}`}
//             />
//           </div>
//         </div>
//       ),
//     },

//   ];

//   const filterMenuProps: IContextualMenuProps = {
//     items: [
//       {
//         key: 'filter',
//         text: 'Filter Departments',
//         onRender: () => (
//           <SearchBox
//             value={filterText}
//             onChange={(e, newValue) => handleFilterChange(newValue || '')}
//             styles={{ root: { width: 200 } }}
//             placeholder="Search..."
//           />
//         ),
//       },
//     ],
//     target: filterDropdownTarget,
//     onDismiss: () => {
//       if (filterText.trim() === '') {
//         setFilterDropdownVisible(false);
//       }
//     },
//     directionalHint: 5,
//   };

//   const tableContainerStyle = {
//     width: '100%',
//     overflow: 'hidden',
//   };

//   return (
//     <div className='p-3' style={{ position: 'relative' }}>
//       {loading && <LoadingSpinner />}
//       <div className='d-flex justify-content-between align-items-center' style={{ position: 'sticky', top: 0, padding: "10px 0 10px 0", zIndex: 100, }}>
//         <div className={`${Styles.tableTitle}`}>Departments<div style={{ fontSize: "10px" }}>Total Count : {departments.length}</div></div>
//         <div className='d-flex gap-2 '>
//           <button onClick={addNewDepartment} className={`${Styles.primaryButton}`}>
//             <div className={`${Styles.primaryButtonIcon}`} ><HiPlusCircle size={20} /></div><span className={``}> Add Department</span> </button>
//           <button onClick={exportToExcel} className={`${Styles.secondaryButton}`}><div className={`${Styles.secondaryButtonIcon}`} ><BsFileEarmarkSpreadsheetFill size={15} /></div> <span className={``}>Export to Excel</span> </button>
//         </div>
//       </div>
//       {filterDropdownVisible && <div style={{ position: 'absolute', zIndex: 1000 }}><ContextualMenu {...filterMenuProps} /></div>}
//       <div style={tableContainerStyle}>
//         <DetailsList
//           items={paginatedDepartments}
//           columns={columns}
//           setKey='set'
//           layoutMode={DetailsListLayoutMode.fixedColumns}
//           selectionMode={SelectionMode.none}
//           styles={detailsListStyles}
//         />
//       </div>
//       {renderPaginationControls()}
//       <Dialog
//         hidden={!isDialogOpen}
//         onDismiss={closeDialog}
//         dialogContentProps={{
//           type: DialogType.normal,
//           title: dialogTitle,
//           subText: dialogMessage,
//         }}
//         styles={{
//           main: dialogStyles.dialogContainer, // Apply custom styles to the dialog
//         }}
//       >
//         <div className="float-end m-3">
//           <button className={`${Styles.closeButton} px-3`} onClick={closeDialog} > OK </button>
//         </div>
//       </Dialog>

//       {/* <ConfirmationDialog
//         hidden={!deleteDialogVisible}
//         onDismiss={() => setDeleteDialogVisible(false)}
//         onConfirm={confirmDelete}
//         title="Delete Department"
//         subText={`Are you sure you want to delete the department "${departmentToDelete?.name}"? Please note that this action cannot be reversed`}
//         confirmButtonText="Delete"
//         cancelButtonText="Cancel"
//       /> */}
//     </div>
//   );
// };

// export default DepartmentTable;
