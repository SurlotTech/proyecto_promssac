FROM golang:1.25-bookworm AS build
ENV CGO_ENABLED=0 GOMAXPROCS=2
RUN go install -p 2 -trimpath -ldflags="-s -w" github.com/minio/minio@RELEASE.2025-10-15T17-29-55Z
RUN go install -p 2 -trimpath -ldflags="-s -w" github.com/minio/mc@RELEASE.2025-08-13T08-35-41Z
RUN mkdir /licenses && cp "$(go list -m -f '{{.Dir}}' github.com/minio/minio@RELEASE.2025-10-15T17-29-55Z)/LICENSE" /licenses/LICENSE.minio && cp "$(go list -m -f '{{.Dir}}' github.com/minio/mc@RELEASE.2025-08-13T08-35-41Z)/LICENSE" /licenses/LICENSE.mc

FROM alpine:3.22
RUN apk add --no-cache ca-certificates tzdata curl && addgroup -g 10001 minio && adduser -D -u 10001 -G minio minio && mkdir /data && chown minio:minio /data
COPY --from=build /go/bin/minio /go/bin/mc /usr/local/bin/
COPY --from=build /licenses /licenses
USER 10001:10001
VOLUME /data
EXPOSE 9000 9001
ENTRYPOINT ["minio"]
CMD ["server", "/data", "--address", ":9000", "--console-address", ":9001"]
