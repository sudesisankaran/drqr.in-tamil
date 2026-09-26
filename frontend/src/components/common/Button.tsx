import React from "react";

type ButtonProps = {
    text: string;
    icon?: React.ReactNode;
    type: "submit" | "button"
    loading?: boolean;
};

const Button = ({ text, icon, type, loading = false }: ButtonProps) => {
    return (
        <button className="w-full bg-blue-900 text-white py-3 rounded-md font-semibold hover:bg-blue-950 transition flex items-center justify-center gap-2" type={type} disabled={loading}>
            {icon}
            {text}
        </button>
    );
};

export default Button;