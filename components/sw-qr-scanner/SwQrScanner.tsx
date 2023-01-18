import {
  faCheckCircle,
  faCamera,
  faImage,
  faCameraRotate,
} from '@fortawesome/free-solid-svg-icons';
import { BrowserQRCodeReader } from '@zxing/browser';
import classNames from 'classnames';
import Dialog from 'rc-dialog';
import type { ChangeEventHandler } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Info } from 'phosphor-react';
import type { Result } from '@zxing/library';
import SwModal from '../sw-modal';
import { ModalContext } from '../sw-modal/provider';
import { getTransitionName } from '../_util/motion';
import QrReader from './QrReader';
import Icon from '../icon';
import SwSubHeader from '../sw-sub-header';
import type { ButtonProps } from '../button';
import Button from '../button';
import { ConfigContext } from '../config-provider';
import useStyle from './style';
import { NoCompactStyle } from '../space/Compact';
import { NoFormStyle } from '../form/context';

interface VideoDeviceInfo extends Pick<MediaDeviceInfo, 'deviceId' | 'groupId' | 'label'> {
  key: string;
}
export interface ScannerResult {
  text: string;
  raw: Uint8Array;
}

type getContainerFunc = () => HTMLElement;
export interface SwQrScannerProps {
  className?: string;
  prefixCls?: string;
  onSuccess: (value: ScannerResult) => void;
  onError: (value: string) => void;
  onClose: () => void;
  open: boolean;
  getContainer?: string | HTMLElement | getContainerFunc | false;
  width?: number | string;
  wrapClassName?: string;
  rightIconProps?: ButtonProps;
  isError?: boolean;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  overlay?: React.ReactNode;
}

const filterVideoMediaFunction = (devices: MediaDeviceInfo[]): MediaDeviceInfo[] =>
  devices.filter((device) => device.kind === 'videoinput');

const convertFunction = (device: MediaDeviceInfo): VideoDeviceInfo => ({
  label: device.label,
  groupId: device.groupId,
  deviceId: device.deviceId,
  key: `${device.groupId}_${device.deviceId}`,
});

const MODAL_ID = 'select-camera-modal';
const VIDEO_ID = 'qr-scanner';
const SwQrScanner: React.FC<SwQrScannerProps> = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    onError,
    onSuccess,
    open,
    onClose,
    getContainer,
    width = 400,
    wrapClassName,
    rightIconProps,
    isError,
    title = 'Scan QR code',
    description,
    overlay,
    footer,
  } = props;
  const { getPopupContainer: getContextPopupContainer, getPrefixCls } =
    React.useContext(ConfigContext);
  const { activeModal, inactiveModal } = React.useContext(ModalContext);

  const rootPrefixCls = getPrefixCls();
  const prefixCls = getPrefixCls('sw-qr-scanner', customizePrefixCls);
  const [wrapSSR, hashId] = useStyle(prefixCls);

  const wrapClassNameExtended = useMemo(
    (): string =>
      classNames(hashId, wrapClassName, `${prefixCls}-container`, {
        [`${prefixCls}-hidden`]: !open,
      }),
    [hashId, wrapClassName, prefixCls],
  );

  const classNameExtended = useMemo(
    (): string => classNames(hashId, className, `${prefixCls}-container`),
    [hashId, className, prefixCls],
  );

  const fileRef = useRef<HTMLInputElement>(null);

  const [devices, setDevices] = useState<VideoDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<VideoDeviceInfo | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const constraints = useMemo(
    (): MediaTrackConstraints => ({
      facingMode: 'user',
      aspectRatio: 2 / 3,
      deviceId: selectedDevice?.deviceId,
      groupId: selectedDevice?.groupId,
    }),
    [selectedDevice],
  );

  const onOpenFile = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const onScan = useCallback(
    (result: Result | undefined | null, error: Error | undefined | null) => {
      if (result) {
        onSuccess({
          raw: result.getRawBytes(),
          text: result.getText(),
        });
      }

      if (error && error.message) {
        onError(error.message);
      }
    },
    [onError, onError],
  );

  const onOpenSelectCamera = useCallback(() => {
    activeModal(MODAL_ID);
  }, [activeModal]);

  const onCloseSelectCamera = useCallback(() => {
    inactiveModal(MODAL_ID);
  }, [inactiveModal]);

  const onSelectDevice = useCallback(
    (value: VideoDeviceInfo): (() => void) =>
      () => {
        setSelectedDevice(value);
        inactiveModal(MODAL_ID);
      },
    [inactiveModal],
  );

  const onChangeFile: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setLoading(true);
      const file = event.target.files ? event.target.files[0] : null;

      if (file) {
        const codeReader = new BrowserQRCodeReader();
        const reader = new FileReader();
        reader.onload = () => {
          codeReader
            .decodeFromImageUrl(reader.result as string)
            .then((value) => {
              onScan(value, null);
            })
            .catch((error: Error) => {
              if (error.name === 'NotFoundException') {
                error.message = 'Invalid QR code, please try again';
              }
              onScan(null, error);
            })
            .finally(() => {
              setLoading(false);
            });
        };
        reader.readAsDataURL(file);
      } else {
        setLoading(false);
      }
    },
    [onScan],
  );

  useEffect(() => {
    setSelectedDevice((prevState) => {
      if (!prevState) {
        return devices[0];
      }

      if (!devices.length) {
        return undefined;
      }

      const exists = devices.find(
        (device) => prevState.key === `${device.groupId}_${device.deviceId}`,
      );

      if (exists) {
        return exists;
      }

      return devices[0];
    });
  }, [devices]);

  useEffect(() => {
    let amount = true;
    const updateDeviceList = () => {
      navigator.mediaDevices.enumerateDevices().then((_devices) => {
        if (amount) {
          const filtered = filterVideoMediaFunction(_devices);
          setDevices(filtered.map(convertFunction));
        }
      });
    };

    navigator.mediaDevices.addEventListener('devicechange', updateDeviceList);
    updateDeviceList();

    return () => {
      amount = false;
      navigator.mediaDevices.removeEventListener('devicechange', updateDeviceList);
    };
  }, []);

  return wrapSSR(
    <NoCompactStyle>
      <NoFormStyle status override>
        <Dialog
          width={width}
          getContainer={getContainer === undefined ? getContextPopupContainer : getContainer}
          prefixCls={prefixCls}
          rootClassName={hashId}
          wrapClassName={wrapClassNameExtended}
          closable={false}
          visible={open}
          onClose={onClose}
          transitionName={getTransitionName(rootPrefixCls, 'slide-down')}
          maskTransitionName={getTransitionName(rootPrefixCls, 'fade')}
          className={classNames(hashId, className)}
        >
          <div className={classNames(`${prefixCls}-scanner`)}>
            <QrReader
              className="qr-scanner-container"
              constraints={constraints}
              onResult={onScan}
              scanDelay={150}
              videoId={VIDEO_ID}
              videoContainerStyle={{ paddingTop: '150%' }}
            />
          </div>
          <div className={classNameExtended}>
            <div className={classNames(`${prefixCls}-top-part`)}>
              <SwSubHeader
                center
                showBackButton
                paddingVertical
                onBack={onClose}
                background="transparent"
                title={title}
                rightButtons={
                  rightIconProps
                    ? [rightIconProps]
                    : [{ icon: <Icon type="phosphor" phosphorIcon={Info} /> }]
                }
              />
              {description && (
                <div className={classNames(`${prefixCls}-description`)}>{description}</div>
              )}
            </div>
            <div
              className={classNames(`${prefixCls}-center-part`, {
                [`${prefixCls}-scan-error`]: isError,
              })}
            >
              <div className={classNames(`${prefixCls}-left-part`)}>
                <div className={classNames(`${prefixCls}-top-left-conner`)} />
                <div className={classNames(`${prefixCls}-bottom-left-conner`)} />
              </div>
              <div className={classNames(`${prefixCls}-center-filter`)}>
                <div className={classNames(`${prefixCls}-center-overlay`)}>{overlay}</div>
              </div>
              <div className={classNames(`${prefixCls}-right-part`)}>
                <div className={classNames(`${prefixCls}-top-right-conner`)} />
                <div className={classNames(`${prefixCls}-bottom-right-conner`)} />
              </div>
            </div>
            <div className={classNames(`${prefixCls}-bottom-part`)}>
              {footer || (
                <div className={classNames(`${prefixCls}-footer`)}>
                  <input
                    className={classNames(`${prefixCls}-hidden-input`)}
                    type="file"
                    onChange={onChangeFile}
                    accept="image/*"
                    ref={fileRef}
                  />
                  <Button
                    onClick={onOpenFile}
                    icon={<Icon type="fontAwesome" fontawesomeIcon={faImage} />}
                    loading={loading}
                    schema='secondary'
                  >
                    Upload from photos
                  </Button>
                  <Button
                    onClick={onOpenSelectCamera}
                    icon={<Icon type="fontAwesome" fontawesomeIcon={faCameraRotate} />}
                    schema='secondary'
                  />
                </div>
              )}
            </div>
          </div>
        </Dialog>
        <SwModal id={MODAL_ID} title="Select camera" onCancel={onCloseSelectCamera} maskClosable>
          <div className={classNames(hashId, `${prefixCls}-camera-items-container`)}>
            {devices.map((device) => {
              const _selected = device.key === selectedDevice?.key;

              return (
                <div
                  key={device.key}
                  onClick={onSelectDevice(device)}
                  className={classNames(`${prefixCls}-camera-item`)}
                >
                  <div className={classNames(`${prefixCls}-camera-icon`)}>
                    <Icon type="fontAwesome" fontawesomeIcon={faCamera} size="xs" />
                  </div>
                  <div className={classNames(`${prefixCls}-camera-label`)}>{device.label}</div>
                  {_selected && (
                    <div className={classNames(`${prefixCls}-camera-selected`)}>
                      <Icon type="fontAwesome" fontawesomeIcon={faCheckCircle} size="xs" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SwModal>
      </NoFormStyle>
    </NoCompactStyle>,
  );
};

export default SwQrScanner;