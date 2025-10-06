import React from "react";

const Privacy = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-green-800 mb-4">Privacy Policy</h1>
      <div className="h-1 w-20 bg-yellow-400 mb-8"></div>

      <p className="mb-6 text-gray-700">
        Effective Date: [Insert Date] <br />
        Last Updated: [Insert Date]
      </p>

      <p className="mb-6 text-gray-700">
        Parikshapath (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;,
        &quot;us&quot;) values and respects the privacy of every individual who
        uses our website, mobile application, products, and services
        (collectively, “Services”). This Privacy Policy outlines how we collect,
        use, disclose, and protect your information in compliance with the
        Information Technology Act, 2000, the Information Technology (Reasonable
        Security Practices and Procedures and Sensitive Personal Data or
        Information) Rules, 2011, and other applicable data protection laws.
      </p>

      <p className="mb-6 text-gray-700">
        By using our Services, you agree to the practices described in this
        Privacy Policy. If you do not agree, please do not use our Services.
      </p>

      <div className="space-y-8 text-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            1. Information We Collect
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Personal Information: Name, DOB, contact details,
              educational/demographic details, payment details (via secure
              gateway).
            </li>
            <li>
              Usage Information: Device details, IP, browser type, log data,
              cookies.
            </li>
            <li>
              Sensitive Personal Data: Passwords, financial details, ID docs
              (only if required).
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To provide, improve, and customize services</li>
            <li>Process payments, registrations, and transactions</li>
            <li>Prevent fraud, verify identity, comply with laws</li>
            <li>Send updates and promotional materials (with consent)</li>
            <li>Analytics and research</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            3. Sharing & Disclosure
          </h2>
          <p>
            No selling or renting of data. May share with service providers,
            legal authorities, or in mergers (under confidentiality).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            4. Cookies & Tracking
          </h2>
          <p>
            Used for functionality and analytics; users may disable via browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            5. Data Retention
          </h2>
          <p>
            Retained as required by business/legal needs; can request deletion.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            6. Data Security
          </h2>
          <p>
            Encryption, firewalls, secure servers; users advised of inherent
            internet risks.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            7. User Rights
          </h2>
          <p>
            Access, correct, update, delete, withdraw consent, opt-out of
            marketing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            8. Third-Party Links
          </h2>
          <p>Not responsible for external sites’ privacy practices.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            9. Children’s Privacy
          </h2>
          <p>Not for children under 13 without guardian consent.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            10. Updates
          </h2>
          <p>Policy may be updated with posted revisions.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            11. Grievance Redressal
          </h2>
          <p>
            Grievance Officer: Sandeep Jangra <br />
            Email: myparikshapath@gmail.com <br />
            Phone: +919992266559 <br />
            Address: Not to be disclosed for privacy reasons
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
