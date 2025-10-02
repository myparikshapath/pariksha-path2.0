// pages/privacy.tsx
import React from "react";

const Privacy = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-green-800 mb-4">Privacy Policy</h1>
            <div className="h-1 w-20 bg-yellow-400 mb-8"></div>

            <p className="mb-6 text-gray-700">
                Effective Date: 01-10-2025 <br />
                Website: Parikshapath (“we,” “our,” or “us”)
            </p>

            <p className="mb-6 text-gray-700">
                Parikshapath values your privacy and is committed to protecting your
                personal data in compliance with applicable laws. This Privacy Policy
                explains how we collect, use, disclose, protect, and store your
                information when you use our website, mobile application, or related
                services.
            </p>

            <div className="space-y-8 text-gray-700">
                <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                        1. Information We Collect
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            <b>Personal Information:</b> Name, email, phone, DOB, postal
                            address, registration details.
                        </li>
                        <li>
                            <b>Educational Data:</b> Exam preferences, performance records,
                            test results, study progress.
                        </li>
                        <li>
                            <b>Financial Information:</b> Payment details (via secure
                            third-party gateways, no card storage).
                        </li>
                        <li>
                            <b>Technical Data:</b> IP address, browser, device, geolocation
                            (if enabled).
                        </li>
                        <li>
                            <b>Cookies & Tracking:</b> To enhance functionality, personalize
                            content, and analyze traffic.
                        </li>
                    </ul>
                </div>

                {/* Baaki points bhi isi tarah */}
            </div>
        </div>
    );
};

export default Privacy;
