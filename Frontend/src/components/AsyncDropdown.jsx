import React from "react";
import AsyncSelect from "react-select/async";

export default function AsyncDropdown({
    label,
    value,
    onChange,
    placeholder,
    fetchOptions,
    defaultOptions = [],
    getOptionLabel = (option) => option.label,
    getOptionValue = (option) => option.value,
    width = "300px",
}) {
    // async loadOptions function called by react-select
    const loadOptions = async (inputValue) => {
        try {
            if (!inputValue) {
                // return top N default options if input is empty
                return defaultOptions.map((item) => ({
                    label: getOptionLabel(item),
                    value: getOptionValue(item),
                    raw: item,
                }));
            }
            // fetch from backend
            console.log("AsyncDropdown fetching options for:", inputValue);
            
            const results = await fetchOptions(inputValue);
            console.log("AsyncDropdown fetched options:", results);
            if(label === "products") {
                return results?.data?.products?.map((item) => ({
                    label: getOptionLabel(item),
                    value: getOptionValue(item),
                    raw: item,
                }));
            }
            if(label === "workCenters") {
                return results?.map((item) => ({
                    label: getOptionLabel(item),
                    value: getOptionValue(item),
                    raw: item,
                }));
            }
            return results?.data?.[label]?.map((item) => ({
                label: getOptionLabel(item),
                value: getOptionValue(item),
                raw: item,
            }));
        } catch (err) {
            console.error("AsyncDropdown fetch error:", err);
            return [];
        }
    };

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions={defaultOptions?.map((item) => ({
                label: getOptionLabel(item),
                value: getOptionValue(item),
                raw: item,
            }))}
            loadOptions={loadOptions}
            value={
                value
                    ? {
                          label: getOptionLabel(value),
                          value: getOptionValue(value),
                          raw: value,
                      }
                    : null
            }
            onChange={(selected) => onChange(selected?.raw || null)}
            placeholder={placeholder || "Select..."}
            isClearable
            menuPortalTarget={
                typeof document !== "undefined" ? document.body : null
            }
            styles={{
                container: (base) => ({ ...base, width }),
                control: (base) => ({ ...base, width }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 9999, width }),
            }}
        />
    );
}
