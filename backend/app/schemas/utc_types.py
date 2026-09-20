from datetime import datetime
from typing import Annotated

from pydantic import AfterValidator, PlainSerializer

from app.core.timeutil import as_naive_utc, to_iso_z

# A datetime that is UTC end-to-end (see app/core/timeutil.py for the why):
#   - incoming: an aware value (e.g. "...Z" from the browser) is normalised to
#     naive UTC, the form every DateTime column stores;
#   - outgoing (JSON only): serialised with a trailing "Z" so browsers
#     don't mistake it for local time. Python-side `model_dump()` still returns
#     a real datetime.
UTCDateTime = Annotated[
    datetime,
    AfterValidator(as_naive_utc),
    PlainSerializer(to_iso_z, return_type=str, when_used="json"),
]
