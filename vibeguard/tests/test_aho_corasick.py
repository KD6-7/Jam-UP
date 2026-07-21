from app.aho_corasick import AhoCorasick


def test_finds_all_overlapping_matches():
    ac = AhoCorasick(["he", "she", "his", "hers"])
    found = {(s, e, p) for s, e, p in ac.find("ushers")}
    # "she" at 1..4, "he" at 2..4, "hers" at 2..6
    assert (1, 4, "she") in found
    assert (2, 4, "he") in found
    assert (2, 6, "hers") in found


def test_case_insensitive():
    ac = AhoCorasick(["Acme"])
    assert any(p == "Acme" for _, _, p in ac.find("welcome to acme corp"))


def test_case_sensitive_mode():
    ac = AhoCorasick(["Acme"], case_insensitive=False)
    assert ac.find("acme") == []
    assert len(ac.find("Acme")) == 1


def test_no_false_match():
    ac = AhoCorasick(["secret"])
    assert ac.find("nothing here") == []
