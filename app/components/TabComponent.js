import React from "react";

export const Tabs = ({ children, value, onChange }) => {
  return (
    <div className="mb-4">
      <div className="flex border-b">
        {React.Children.map(children, (child) => {
          if (child.type === Tab) {
            return React.cloneElement(child, {
              active: child.props.value === value,
              onClick: () => onChange(child.props.value),
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const Tab = ({ children, value, active, onClick }) => {
  return (
    <button
      type="button" // 폼 제출을 방지하기 위해 type을 "button"으로 설정
      className={`py-2 px-4 font-semibold ${
        active ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const TabPanel = ({ children, value, index }) => {
  return value === index ? <div>{children}</div> : null;
};
