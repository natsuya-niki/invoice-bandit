freee:
	pnpm playwright test tests/freee.spec.ts --project=chromium --headed
.PHONY: freee

attcom:
	pnpm playwright test tests/attcom.spec.ts --project=chromium --headed
.PHONY: attcom

d_vitual_office:
	pnpm playwright test tests/d_virtual_office.spec.ts --project=chromium --headed
.PHONY: d_vitual_office

choco1:
	TEST_PROFILE=profile1 pnpm playwright test tests/chocozap.spec.ts --project=chromium --headed
.PHONY: choco1

choco2:
	TEST_PROFILE=profile2 pnpm playwright test tests/chocozap.spec.ts --project=chromium --headed
.PHONY: choco2

