import React, { useState } from "react";
import "./form.css";

const initialFormState = {
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
};

const Form = () => {
  const [form, setForm] = useState(initialFormState);
  const [formKey, setFormKey] = useState(0);

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

  const calculateAge = (dob) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ AGE VALIDATION
    const age = calculateAge(form.dob);
    if (age < 18) {
      alert("❌ Minimum age should be 18 years");
      return;
    }

    // Address validation
    if (!form.sameAsResidential) {
      if (!form.permanentAddress.street1 || !form.permanentAddress.street2) {
        alert("❌ Permanent address required");
        return;
      }
    }

    if (form.documents.length < 2) {
      alert("❌ Minimum 2 documents required");
      return;
    }

    try {
      const formData = new FormData();

      form.documents.forEach((doc) => {
        formData.append("documents", doc.file);
      });

      formData.append("data", JSON.stringify(form));

      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000";

      const res = await fetch(`${API_URL}/api/form`, {
        method: "POST",
        body: formData
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        alert("Server error (not JSON)");
        return;
      }

      alert(data.msg || "Submitted Successfully ✅");

      // ✅ RESET FORM AFTER SUCCESS
      setForm(initialFormState);
      setFormKey((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Error submitting form ❌");
    }
  };

  return (
    <form
      key={formKey}
      className="container"
      onSubmit={handleSubmit}
    >
      <h2>Candidate Form</h2>

      <div className="row">
        <div className="field">
          <label>First Name *</label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Last Name *</label>
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Date of Birth *</label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            required
          />
          <small>Minimum age: 18 years</small>
        </div>
      </div>

      <h3>Residential Address</h3>
      <div className="row">
        <div className="field">
          <label>Street 1 *</label>
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
          <label>Street 2 *</label>
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

      <label>
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

      <h3>Upload Documents</h3>

      {form.documents.map((doc, i) => (
        <div className="doc-row" key={i}>
          <input
            placeholder="File Name"
            required
            onChange={(e) =>
              handleDocChange(i, "fileName", e.target.value)
            }
          />

          <select
            required
            onChange={(e) =>
              handleDocChange(i, "fileType", e.target.value)
            }
          >
            <option value="">Type</option>
            <option value="image">Image</option>
            <option value="pdf">PDF</option>
          </select>

          <input
            type="file"
            required
            accept={doc.fileType === "pdf" ? ".pdf" : "image/*"}
            onChange={(e) =>
              handleDocChange(i, "file", e.target.files[0])
            }
          />

          {i === 0 ? (
            <button type="button" onClick={addDoc}>
              +
            </button>
          ) : (
            <button type="button" onClick={() => removeDoc(i)}>
              🗑
            </button>
          )}
        </div>
      ))}

      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;