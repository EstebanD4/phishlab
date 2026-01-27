import { useMemo, useState } from "react";
import "../App.css";
import { useEmailList } from "../hooks/useEmailList";
import { useNavigate } from "react-router-dom";
import styles from "./campaignBuilder.module.css";

function CampaignBuilder() {
    const nav = useNavigate();
    // ===== Emails (colonne centrale) via hook =====
    const {
        emails,
        newEmail,
        setNewEmail,
        emailError,
        liveNewEmailError,
        canAdd,
        addEmail,
        removeEmail,
        importFake,
        clearEmails,
    } = useEmailList();

    // ===== Form campagne (colonne gauche) =====
    const [campaignName, setCampaignName] = useState("");
    const [domainName, setDomainName] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");

    // ===== Campagnes (colonne droite) =====
    const [campaigns, setCampaigns] = useState([]);

    // ===== “Touched” pour erreurs live (évite d’afficher tout rouge au chargement) =====
    const [touched, setTouched] = useState({
        campaignName: false,
        domainName: false,
        emailSubject: false,
        emailBody: false,
        emails: false,
    });

    // ===== Erreur runtime (si besoin) =====
    const [error, setError] = useState(null);

    // ===== Erreurs live (champ par champ) =====
    const liveErrors = useMemo(() => {
        const e = {};

        if (touched.campaignName && !campaignName.trim()) {
            e.campaignName = "Campaign name is required.";
        }
        if (touched.domainName && !domainName.trim()) {
            e.domainName = "Domain name is required.";
        }
        if (touched.emailSubject && !emailSubject.trim()) {
            e.emailSubject = "Email subject is required.";
        }
        if (touched.emailBody && !emailBody.trim()) {
            e.emailBody = "Email body is required.";
        }
        if (touched.emails && emails.length === 0) {
            e.emails = "Please add at least one target email.";
        }

        return e;
    }, [touched, campaignName, domainName, emailSubject, emailBody, emails.length]);

    // ===== Validité globale =====
    const isCampaignValid = useMemo(() => {
        return (
            campaignName.trim() &&
            domainName.trim() &&
            emailSubject.trim() &&
            emailBody.trim() &&
            emails.length > 0
        );
    }, [campaignName, domainName, emailSubject, emailBody, emails.length]);

    function markAllTouched() {
        setTouched({
            campaignName: true,
            domainName: true,
            emailSubject: true,
            emailBody: true,
            emails: true,
        });
    }

    function handleCreateCampaign() {
        setError(null);
        markAllTouched();

        if (!isCampaignValid) {
            // Pas besoin de setError obligatoire, les erreurs live suffisent
            // mais on garde un message global si tu veux :
            setError("Please fix the errors before creating the campaign.");
            return;
        }

        const newCampaign = {
            id: Date.now(),
            name: campaignName.trim(),
            domain: domainName.trim(),
            subject: emailSubject.trim(),
            body: emailBody,
            targets: [...emails],
            createdAt: new Date().toISOString(),
        };

        setCampaigns((prev) => [newCampaign, ...prev]);

        // reset
        setCampaignName("");
        setDomainName("");
        setEmailSubject("");
        setEmailBody("");
        clearEmails();
        setError(null);
        setTouched({
            campaignName: false,
            domainName: false,
            emailSubject: false,
            emailBody: false,
            emails: false,
        });
    }

    return (
        <div className={styles.gbuilder}>
            <h1>Campaign Builder</h1>

            <div className={styles.campaignBuilderContainer}>
                {/* ===== Colonne gauche ===== */}
                <div className={styles.emailContent}>
                    {error && <div className={styles.errorBox}>{error}</div>}

                    <div className={styles.sending}>
                        <div className={styles.campaign}>
                            <input
                                inputMode="text"
                                placeholder="Enter the campaign name"
                                className={`${styles.campaignInput} ${liveErrors.campaignName ? "inputError" : ""}`}
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, campaignName: true }))}
                            />
                            {liveErrors.campaignName && (
                                <div className={styles.fieldError}>{liveErrors.campaignName}</div>
                            )}
                        </div>

                        <div className={styles.domain}>
                            <input
                                inputMode="url"
                                placeholder="Enter domain name"
                                className={`${styles.domainInput} ${liveErrors.domainName ? "inputError" : ""}`}
                                value={domainName}
                                onChange={(e) => setDomainName(e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, domainName: true }))}
                            />
                            {liveErrors.domainName && (<div className={styles.fieldError}>{liveErrors.domainName}</div>)}
                        </div>
                    </div>

                    <div className={styles.object}>
                      <input
                          inputMode="text"
                          className={`${styles.objectInput} ${liveErrors.emailSubject ? "inputError" : ""}`}
                          placeholder="Enter the subject of the email"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, emailSubject: true }))}
                      />
                      {liveErrors.emailSubject && (<div className={styles.fieldError}>{liveErrors.emailSubject}</div>)}
                    </div>
                    <div className={styles.corpEmail}>
                      <textarea
                          className={`${styles.corpEmailTextArea} ${liveErrors.emailBody ? "inputError" : ""}`}
                          placeholder="Enter the email body"
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          onBlur={() => setTouched((t) => ({ ...t, emailBody: true }))}
                      />
                      {liveErrors.emailBody && (<div className={styles.fieldError}>{liveErrors.emailBody}</div>)}
                    </div>
                    <div className={styles.builderActions}>
                        <button className={styles.buttonCreateCampaign} onClick={handleCreateCampaign}>Create Campaign</button>
                    </div>

                    <div className={styles.tip}>
                        Tip: add targets in the middle column before creating the campaign.
                    </div>
                </div>

                {/* ===== Colonne centrale : emails ===== */}
                <div className={styles.adressList}>
                    <h2>Emails</h2>

                    <button className={styles.importCsv} onClick={() => { importFake(); setTouched((t) => ({ ...t, emails: true })); }}> import csv </button>

                    <div className={styles.addEmailRow}>
                        <input
                            inputMode="email"
                            placeholder="Add email (ex: user@company.com)"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            onFocus={() => setTouched((t) => ({ ...t, emails: true }))}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {addEmail(); setTouched((t) => ({ ...t, emails: true }));}}}
                            className={`${styles.inputEmailRow} ${liveNewEmailError ? styles.inputError : ""}`}/>
                        <button onClick={() => { addEmail(); setTouched((t) => ({ ...t, emails: true }));}} disabled={!canAdd}> Add </button>
                    </div>

                    {/* Erreur live du champ “newEmail” */}
                    {liveNewEmailError && <div className={styles.fieldError}>{liveNewEmailError}</div>}

                    {/* Erreur “submit” du hook (ex: empty, etc.) */}
                    {emailError && <div className={styles.fieldError}>{emailError}</div>}

                    {/* Erreur live : aucun email dans la liste (si touché) */}
                    {liveErrors.emails && <div className={styles.fieldError}>{liveErrors.emails}</div>}

                    <div className={styles.emailList}>
                        {emails.length === 0 ? (
                            <p style={{ color: "#666", fontSize: 13 }}>No emails imported yet.</p>
                        ) : (
                            emails.map((email) => (
                                <div key={email} className={styles.emailItem}>
                                    <span>{email}</span>
                                    <button className={styles.emailRemove} onClick={() => removeEmail(email)} title="Remove">
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ===== Colonne droite : campagnes ===== */}
                <div className={styles.campaignsList}>
                    <h2>Existing Campaigns</h2>

                    {campaigns.length === 0 ? (
                        <p style={{ color: "#666", fontSize: 13 }}>No campaigns yet.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {campaigns.map((c) => (
                                <div
                                    key={c.id}
                                    style={{
                                        padding: "10px 12px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 10,
                                        background: "rgb(100, 100, 100)",
                                        textAlign: "left",
                                    }}
                                >
                                    <div style={{ fontWeight: 700 }}>{c.name}</div>
                                    <div style={{ fontSize: 12, color: "#fff" }}>
                                        {c.domain} • {c.targets.length} target(s)
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <button className={styles.buttonBack} onClick={() => nav("/")}>Back</button>
        </div>
    );
}

export default CampaignBuilder;