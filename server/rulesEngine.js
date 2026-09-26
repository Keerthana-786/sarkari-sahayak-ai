/**
 * Sarkari Sahayak — Deterministic Rules Engine
 * 
 * Rules engine evaluates citizen profile against scheme criteria programmatically.
 * Safety Promise: Eligibility decisions are 100% deterministic code execution.
 */

export function evaluateEligibility(profile, schemes) {
  if (!profile || typeof profile !== 'object') {
    return { evaluated_at: new Date().toISOString(), results: [], conflicts: [] };
  }

  const results = schemes.map(scheme => {
    const criteriaEvaluations = [];
    let isEligible = true;
    let failReason = null;
    let failReasonHi = null;
    let failReasonTa = null;

    // 1. State Level Check
    if (scheme.level === 'state' && scheme.state !== 'all') {
      const citizenState = (profile.state || '').trim().toLowerCase();
      const schemeState = (scheme.state || '').trim().toLowerCase();
      
      if (citizenState && citizenState !== schemeState) {
        isEligible = false;
        failReason = `Residency requirement mismatch: Scheme is for residents of ${scheme.state}, citizen is in ${profile.state || 'unspecified state'}.`;
        failReasonHi = `निवास आवश्यकता बेमेल: यह योजना ${scheme.state} के निवासियों के लिए है, आपकी प्रोफाइल में राज्य ${profile.state || 'अनिर्दिष्ट'} दर्ज है।`;
        failReasonTa = `இருப்பிடத் தேவை பொருந்தவில்லை: திட்டம் ${scheme.state} மாநிலத்தவருக்கு மட்டுமே உரியது, குடிமகன் ${profile.state || 'குறிப்பிடப்படாத மாநிலம்'} மாநிலத்தைச் சேர்ந்தவர்.`;

        criteriaEvaluations.push({
          field: 'state',
          operator: 'eq',
          expected: scheme.state,
          actual: profile.state || 'Not provided',
          passed: false,
          source_clause: `Residency Rule: Scheme benefits restricted to domicile residents of ${scheme.state}.`,
          source_clause_hi: `निवास नियम: योजना लाभ केवल ${scheme.state} के मूल निवासियों तक सीमित हैं।`,
          source_clause_ta: `இருப்பிட விதி: திட்டம் ${scheme.state} மாநிலத்தை சேர்ந்தவர்களுக்கு மட்டுமே பொருந்தும்.`
        });
      }
    }

    // 2. Evaluate Specific Criteria
    scheme.eligibility_criteria.forEach(criterion => {
      const val = profile[criterion.field];
      let passed = true;

      if (val === undefined || val === null) {
        // Field missing in profile
        passed = false;
        if (isEligible) {
          isEligible = false;
          failReason = `Missing required profile attribute: '${criterion.field}'`;
          failReasonHi = `आवश्यक प्रोफाइल विवरण उपलब्ध नहीं है: '${criterion.field}'`;
          failReasonTa = `தேவையான சுயவிவர விவரம் விடுபட்டுள்ளது: '${criterion.field}'`;
        }
      } else {
        switch (criterion.operator) {
          case 'eq':
            passed = (typeof val === 'string' && typeof criterion.value === 'string')
              ? val.toLowerCase() === criterion.value.toLowerCase()
              : val === criterion.value;
            break;
          case 'lte':
            passed = Number(val) <= Number(criterion.value);
            break;
          case 'gte':
            passed = Number(val) >= Number(criterion.value);
            break;
          case 'in':
            passed = Array.isArray(criterion.value) && criterion.value.includes(val);
            break;
          default:
            passed = true;
        }

        if (!passed && isEligible) {
          isEligible = false;
          failReason = `Does not satisfy criteria for '${criterion.field}' (Found: ${val}, Required: ${criterion.operator} ${criterion.value})`;
          failReasonHi = `'${criterion.field}' की पात्रता मानदंड पूरी नहीं हुई (वर्तमान: ${val}, आवश्यक: ${criterion.operator} ${criterion.value})`;
          failReasonTa = `'${criterion.field}' தகுதிக்கான அளவுகோலை பூர்த்தி செய்யவில்லை (தற்போது: ${val}, தேவை: ${criterion.operator} ${criterion.value})`;
        }
      }

      criteriaEvaluations.push({
        field: criterion.field,
        operator: criterion.operator,
        expected: criterion.value,
        actual: val !== undefined ? val : 'Not provided',
        passed,
        source_clause: criterion.source_clause,
        source_clause_hi: criterion.source_clause_hi || criterion.source_clause,
        source_clause_ta: criterion.source_clause_ta || criterion.source_clause
      });
    });

    // 3. Evaluate Missing Documents
    const citizenDocs = (profile.documents_held || []).map(d => d.toLowerCase());
    const missingDocs = (scheme.required_documents || []).filter(doc => {
      const docLower = doc.toLowerCase();
      return !citizenDocs.some(cd => cd.includes(docLower) || docLower.includes(cd));
    });

    return {
      scheme_id: scheme.id,
      scheme_name: scheme.name,
      scheme_name_hi: scheme.name_hi || scheme.name,
      scheme_name_ta: scheme.name_ta || scheme.name,
      level: scheme.level,
      state: scheme.state,
      description: scheme.description,
      description_hi: scheme.description_hi || scheme.description,
      description_ta: scheme.description_ta || scheme.description,
      benefit_amount_or_type: scheme.benefit_amount_or_type,
      benefit_amount_or_type_hi: scheme.benefit_amount_or_type_hi || scheme.benefit_amount_or_type,
      benefit_amount_or_type_ta: scheme.benefit_amount_or_type_ta || scheme.benefit_amount_or_type,
      is_eligible: isEligible,
      fail_reason: failReason,
      fail_reason_hi: failReasonHi || failReason,
      fail_reason_ta: failReasonTa || failReason,
      criteria_evaluations: criteriaEvaluations,
      required_documents: scheme.required_documents,
      required_documents_hi: scheme.required_documents_hi || scheme.required_documents,
      required_documents_ta: scheme.required_documents_ta || scheme.required_documents,
      missing_documents: missingDocs,
      documents_satisfied_count: (scheme.required_documents.length - missingDocs.length),
      conflicts_with: scheme.conflicts_with || []
    };
  });

  // 4. Conflict Detection among Eligible Schemes
  const eligibleSchemes = results.filter(r => r.is_eligible);
  const conflicts = [];

  for (let i = 0; i < eligibleSchemes.length; i++) {
    for (let j = i + 1; j < eligibleSchemes.length; j++) {
      const schemeA = eligibleSchemes[i];
      const schemeB = eligibleSchemes[j];

      const aConflictsB = schemeA.conflicts_with.includes(schemeB.scheme_id);
      const bConflictsA = schemeB.conflicts_with.includes(schemeA.scheme_id);

      if (aConflictsB || bConflictsA) {
        conflicts.push({
          scheme_a: {
            id: schemeA.scheme_id,
            name: schemeA.scheme_name,
            name_hi: schemeA.scheme_name_hi,
            name_ta: schemeA.scheme_name_ta,
            benefit: schemeA.benefit_amount_or_type,
            benefit_hi: schemeA.benefit_amount_or_type_hi,
            benefit_ta: schemeA.benefit_amount_or_type_ta,
            docs_required: schemeA.required_documents.length
          },
          scheme_b: {
            id: schemeB.scheme_id,
            name: schemeB.scheme_name,
            name_hi: schemeB.scheme_name_hi,
            name_ta: schemeB.scheme_name_ta,
            benefit: schemeB.benefit_amount_or_type,
            benefit_hi: schemeB.benefit_amount_or_type_hi,
            benefit_ta: schemeB.benefit_amount_or_type_ta,
            docs_required: schemeB.required_documents.length
          },
          reason: `Mutual Exclusion Policy: Beneficiary cannot claim both '${schemeA.scheme_name}' and '${schemeB.scheme_name}' in the same financial year.`,
          reason_hi: `परस्पर नीति टकराव: लाभार्थी एक ही वित्तीय वर्ष में '${schemeA.scheme_name_hi}' और '${schemeB.scheme_name_hi}' दोनों का दावा नहीं कर सकता।`,
          reason_ta: `பரஸ்பர கொள்கை மோதல்: பயனாளி ஒரே நிதியாண்டில் '${schemeA.scheme_name_ta}' மற்றும் '${schemeB.scheme_name_ta}' இரண்டையும் பெற முடியாது.`
        });
      }
    }
  }

  // Update status on results to mark conflicts
  const conflictSchemeIds = new Set(conflicts.flatMap(c => [c.scheme_a.id, c.scheme_b.id]));
  results.forEach(r => {
    if (r.is_eligible && conflictSchemeIds.has(r.scheme_id)) {
      r.has_conflict = true;
    } else {
      r.has_conflict = false;
    }
  });

  return {
    evaluated_at: new Date().toISOString(),
    verified_by: "RulesEngine v1.0 (Deterministic Engine)",
    summary: {
      total_schemes: schemes.length,
      eligible_count: eligibleSchemes.length,
      conflicts_count: conflicts.length
    },
    results,
    conflicts
  };
}
