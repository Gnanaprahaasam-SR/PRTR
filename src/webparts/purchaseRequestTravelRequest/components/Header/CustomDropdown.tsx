import React, { FC } from 'react';
import styles from './Header.module.scss';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';

interface CustomDropdownProps {
  toggleText: string;
  items: { text: string; link: string }[];
  icon: JSX.Element;
  activePath: string; // Path of the currently active link
  isOpen: boolean; // Whether the dropdown is open
  onToggle: () => void; // Function to toggle dropdown open/closed
  onClose: () => void; // Function to close dropdown
  onSelect: (link: string) => void; // Function to handle item selection
}

const CustomDropdown: FC<CustomDropdownProps> = ({ toggleText, items, icon, activePath, isOpen, onToggle, onClose, onSelect }) => {
  // Determine if any item in the dropdown is active
  const isActive = items.some(item => item.link === activePath);

  const handleItemClick = (link: string) => {
    onSelect(link);
    onClose(); // Close dropdown after selecting an item
  };

  return (
    <div className={styles.dropdown}>
      <div
        className={`${styles['dropdown-toggle']} ${isActive ? styles.active : ''}`}
        onClick={onToggle}
      >
        {icon} <div className={styles.dropdowntext}>{toggleText} <MdOutlineKeyboardArrowDown /></div>
      </div>
      <div className={`${styles['dropdown-menu']} ${isOpen ? styles.show : ''}`}>
        {items.map((item, index) => (
          <Link
            key={index}
            className={`${styles['dropdown-item']} ${activePath === item.link ? styles.active : ''}`}
            to={item.link}
            onClick={() => handleItemClick(item.link)} // Handle item click
          >
            {item.text}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CustomDropdown;
