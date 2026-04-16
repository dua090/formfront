import React, { useState } from "react";
import "./form.css";

const Form = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    residentialAddress: { street1: "", street2: "" },
    permanentAddress: { street1: "", street2: "" },
    sameAsResidential: false,
    documents: [
      { fileName: "", fileType: "", file: null },
      { fileName: "", fileType: "", file: null }
    ]
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e, type) => {
    setForm({
      ...form,
      [type]: {
        ...form[type],
        [e.target.name]: e.target.value
      }
    });
  };

  const handleCheckbox = () => {
    if (!form.sameAsResidential) {
      setForm({
        ...form,
        sameAsResidential: true,
        permanentAddress: { ...form.residentialAddress }
      });
    } else {
      setForm({
        ...form,
        sameAsResidential: false,
        permanentAddress: { street1: "", street2: "" }
      });
    }
  };

  const handleDocChange = (i, field, value) => {
    const docs = [...form.documents];
    docs[i][field] = value;
    setForm({ ...form, documents: docs });
  };

  const addDoc = () => {
    setForm({
      ...form,
      documents: [
        ...form.documents,
        { fileName: "", fileType: "", file: null }
      ]
    });
  };

  const removeDoc = (index) => {
    const docs = form.documents.filter((_, i) => i !== index);
    setForm({ ...form, documents: docs });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const age =
      new Date().getFullYear() - new Date(form.dob).getFullYear();

    if (age < 18) {
      alert("Minimum age should be 18");
      return;
    }

    if (!form.sameAsResidential) {
      if (
        !form.permanentAddress.street1 ||
        !form.permanentAddress.street2
      ) {
        alert("Permanent address required");
        return;
      }
    }

    if (form.documents.length < 2) {
      alert("Minimum 2 documents required");
      return;
    }

    try {
      const formData = new FormData();

      form.documents.forEach((doc) => {
        formData.append("documents", doc.file);
      });

      formData.append("data", JSON.stringify(form));

      const API_URL = import.meta.env.VITE_API_URL ;      
      const res = await fetch(`${API_URL}/api/form`, {
      method: "POST",
      body: formData
      });
      const text = await res.text();
      console.log("Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        alert("Server error (not JSON)");
        return;
      }

      alert(data.msg || "Submitted Successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Error submitting form ❌");
    }
  };

  return (
    <form className="container" onSubmit={handleSubmit}>
      <h2>Candidate Form</h2>

      {/* Row */}
      <div className="row">
        <div className="field">
          <label>First Name <span>*</span></label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Last Name <span>*</span></label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Row */}
      <div className="row">
        <div className="field">
          <label>E-mail <span>*</span></label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Date of Birth <span>*</span></label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            required
          />
          <small>(Min. age should be 18 Years)</small>
        </div>
      </div>

      {/* Address */}
      <h3>Residential Address</h3>
      <div className="row">
        <div className="field">
          <label>Street 1 <span>*</span></label>
          <input
            name="street1"
            value={form.residentialAddress.street1}
            onChange={(e) =>
              handleAddressChange(e, "residentialAddress")
            }
            required
          />
        </div>

        <div className="field">
          <label>Street 2 <span>*</span></label>
          <input
            name="street2"
            value={form.residentialAddress.street2}
            onChange={(e) =>
              handleAddressChange(e, "residentialAddress")
            }
            required
          />
        </div>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={form.sameAsResidential}
          onChange={handleCheckbox}
        />
        Same as Residential Address
      </label>

      <h3>Permanent Address</h3>
      <div className="row">
        <div className="field">
          <label>Street 1</label>
          <input
            name="street1"
            value={form.permanentAddress.street1}
            onChange={(e) =>
              handleAddressChange(e, "permanentAddress")
            }
            disabled={form.sameAsResidential}
          />
        </div>

        <div className="field">
          <label>Street 2</label>
          <input
            name="street2"
            value={form.permanentAddress.street2}
            onChange={(e) =>
              handleAddressChange(e, "permanentAddress")
            }
            disabled={form.sameAsResidential}
          />
        </div>
      </div>

      {/* Documents */}
      <h3>Upload Documents</h3>

      {form.documents.map((doc, i) => (
        <div className="doc-row" key={i}>
          <div className="doc-field">
            <label>File Name <span>*</span></label>
            <input
              required
              onChange={(e) =>
                handleDocChange(i, "fileName", e.target.value)
              }
            />
          </div>

          <div className="doc-field">
            <label>Type of File <span>*</span></label>

            <select
              required
              onChange={(e) =>
                handleDocChange(i, "fileType", e.target.value)
              }
            >
              <option value="">Select Type</option>
              <option value="image">Image</option>
              <option value="pdf">PDF</option>
            </select>

            <small>(image, pdf)</small>
          </div>

          <div className="doc-field">
            <label>Upload Document <span>*</span></label>
            <input
              type="file"
              required
              accept={doc.fileType === "pdf" ? ".pdf" : "image/*"}
              onChange={(e) =>
                handleDocChange(i, "file", e.target.files[0])
              }
            />
          </div>

          <div className="doc-btn">
            {i === 0 ? (
              <button type="button" className="add-btn" onClick={addDoc}>
                +
              </button>
            ) : (
              <button
                type="button"
                className="delete-btn"
                onClick={() => removeDoc(i)}
              >
                🗑
              </button>
            )}
          </div>
        </div>
      ))}

      <button type="submit" className="submit">
        Submit
      </button>
    </form>
  );
};

export default Form;