import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const DropdownMenu = ({ children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            return React.cloneElement(child, {
              onClick: handleToggle,
              "aria-expanded": isOpen,
            });
          }
          if (child.type === DropdownMenuContent) {
            return React.cloneElement(child, {
              isOpen,
              onClose: handleClose,
            });
          }
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = React.forwardRef(
  ({ className = "", children, asChild = false, onClick, ...props }, ref) => {
    const Component = asChild ? "div" : "button";

    return (
      <Component
        ref={ref}
        onClick={onClick}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef(
  ({ className = "", children, isOpen, onClose, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={`absolute right-0 top-full mt-2 z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 text-gray-900 shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 ${className}`}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === DropdownMenuItem) {
            return React.cloneElement(child, {
              onClick: (e) => {
                if (child.props.onClick) {
                  child.props.onClick(e);
                }
                onClose();
              },
            });
          }
          return child;
        })}
      </div>
    );
  }
);

DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef(
  ({ className = "", children, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`relative flex cursor-pointer select-none items-center rounded-md px-3 py-2.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuItem.displayName = "DropdownMenuItem";

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
};
