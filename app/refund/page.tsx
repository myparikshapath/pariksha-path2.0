// pages/refund.tsx
import React from "react";

const Refund = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-green-800 mb-4">
                Refund & Cancellation Policy
            </h1>
            <div className="h-1 w-20 bg-yellow-400 mb-8"></div>

            <p className="mb-6 text-gray-700">
                Effective Date: 01-10-2025 <br />
                Website: My Parikshapath (“we,” “our,” or “us”)
            </p>

            <p className="mb-6 text-gray-700">
                This Refund & Cancellation Policy applies to all purchases made on the
                My Parikshapath website and mobile application. By enrolling in our courses
                or services, you agree to the terms outlined below.
            </p>

            <div className="space-y-8 text-gray-700">
                <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                        1. General Policy
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            All payments made for courses, test series, and services are
                            considered final.
                        </li>
                        <li>
                            Refunds or cancellations are subject to the specific conditions
                            mentioned herein and under no circumstances shall be made outside
                            these terms.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                        2. Cancellation of Orders
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            Users may cancel their course purchase within 24 hours of payment
                            if the course has not been accessed or downloaded.
                        </li>
                        <li>
                            Once content is accessed (viewed, downloaded, or streamed),
                            cancellation requests will not be entertained.
                        </li>
                        <li>
                            Cancellation requests must be submitted in writing via email to
                            our support team.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                        3. Refund Eligibility
                    </h2>
                    <p>Refunds will be considered only under the following conditions:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Duplicate payment made due to technical error (upon verification).</li>
                        <li>
                            Wrong course batch assigned due to technical issues, if the correct
                            batch cannot be provided.
                        </li>
                        <li>
                            Services not delivered due to cancellation from Parikshapath’s
                            side.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                        4. Non-Refundable Items
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            Fees for courses already accessed, live classes attended, or
                            digital downloads are non-refundable.
                        </li>
                        <li>Enrollment or registration fees are strictly non-refundable.</li>
                        <li>
                            Any third-party service charges (e.g., payment gateway fees,
                            taxes) are non-refundable.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                        5. Refund Process & Timeline
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            Eligible refunds will be processed to the original payment method
                            within 7–14 working days after approval.
                        </li>
                        <li>
                            Proof of transaction (order ID, payment receipt) must be provided
                            by the user for processing refunds.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                        6. Course Validity & Expiry
                    </h2>
                    <ul className="list-disc list-inside space-y-1">
                        <li>
                            Each course/test series has a defined validity period. Once
                            expired, access cannot be renewed unless re-purchased.
                        </li>
                        <li>
                            No refunds will be provided for expired courses, unused services,
                            or unclaimed benefits.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                        7. Changes to Policy
                    </h2>
                    <p>
                        My Parikshapath reserves the right to amend or update this Refund &
                        Cancellation Policy at any time. Any material changes will be
                        communicated through the website or via email notification.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-green-800 mb-2">
                        8. Contact Us
                    </h2>
                    <p>
                        For refund or cancellation requests, please contact:
                        <br />
                        <br />
                        Email: myparikshapath@gmail.com <br />
                        Address: Not to be disclosed for privacy reasons
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Refund;
