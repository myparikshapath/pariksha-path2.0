// pages/terms.tsx
import React from "react";

const Terms = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-green-800 mb-4">
                Terms & Conditions
            </h1>
            <div className="h-1 w-20 bg-yellow-400 mb-8"></div>

            <p className="mb-6 text-gray-700">
                Effective Date: 01-10-2025 <br />
                Website: My Parikshapath (“we,” “our,” or “us”)
            </p>

            <p className="mb-6 text-gray-700">
                These Terms & Conditions (“Terms”) govern your use of the Parikshapath
                website, mobile app, and services. By accessing or using our services,
                you agree to these Terms. If you do not agree, please discontinue use
                immediately.
            </p>

            <div className="space-y-8 text-gray-700">
                <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                        1. Eligibility & Account Registration
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            You must be at least 13 years old (or the minimum age of consent
                            in your jurisdiction) to use our services.
                        </li>
                        <li>
                            You agree to provide accurate and complete registration
                            information and keep it updated.
                        </li>
                        <li>
                            You are responsible for maintaining the confidentiality of your
                            login credentials and all activities under your account.
                        </li>
                    </ul>
                </div>

                {/* Baaki points bhi isi tarah */}
            </div>
        </div>
    );
};

export default Terms;
