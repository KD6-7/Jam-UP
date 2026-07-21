from app.masking import Masker, rehydrate_text


def test_masks_email_and_is_reversible():
    m = Masker()
    result = m.mask("Contact me at jane.doe@example.com please")
    assert "jane.doe@example.com" not in result.text
    assert "[REDACTED_EMAIL_1]" in result.text
    assert rehydrate_text(result.text, result.mapping) == "Contact me at jane.doe@example.com please"


def test_masks_multiple_types():
    m = Masker()
    text = "email a@b.com, key sk-abcdefghijklmnop1234, ssn 123-45-6789, ip 10.0.0.1"
    result = m.mask(text)
    # Token format is [REDACTED_<TYPE>_<n>]; strip the wrapper and trailing index.
    kinds = {t[len("[REDACTED_"):].rsplit("_", 1)[0] for t in result.mapping}
    assert {"EMAIL", "API_KEY", "SSN", "IPV4"}.issubset(kinds)
    assert rehydrate_text(result.text, result.mapping) == text


def test_repeated_value_shares_token():
    m = Masker()
    result = m.mask("mail a@b.com and again a@b.com")
    assert result.text.count("[REDACTED_EMAIL_1]") == 2
    assert len(result.mapping) == 1


def test_consistent_tokens_across_messages():
    m = Masker()
    masked, mapping = m.mask_batch(["from a@b.com", "reply to a@b.com"])
    assert masked[0].endswith("[REDACTED_EMAIL_1]")
    assert masked[1].endswith("[REDACTED_EMAIL_1]")
    assert len(mapping) == 1


def test_blocklist_entity_masking():
    m = Masker(blocklist=["Project Nimbus"])
    result = m.mask("The Project Nimbus launch is delayed")
    assert "Project Nimbus" not in result.text
    assert any(t.startswith("[REDACTED_ENTITY") for t in result.mapping)


def test_blocklist_respects_word_boundary():
    m = Masker(blocklist=["cat"])
    result = m.mask("the category is broad")
    # "cat" inside "category" must not be masked.
    assert result.text == "the category is broad"
