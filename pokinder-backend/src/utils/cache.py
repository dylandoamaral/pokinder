import json
import struct
from ast import Store
from typing import Awaitable, Callable, Optional, Type

from src.utils.pydantic import BaseModel

ONE_MINUTE = 60
ONE_HOUR = 60 * ONE_MINUTE
ONE_DAY = 24 * ONE_HOUR


class Cache:
    def __init__(self, store: Store):
        self.store = store

    async def get(self, key: str) -> Optional[bytes]:
        return await self.store.get(key)

    def __int_to_bytes(self, number: int) -> bytes:
        return number.to_bytes(4, byteorder="big")

    def __bytes_to_int(self, number: bytes) -> int:
        return int.from_bytes(number, byteorder="big")

    async def get_int(self, key: str) -> Optional[int]:
        maybe_key = await self.store.get(key)
        return self.__bytes_to_int(maybe_key) if maybe_key else None

    async def set_int(self, key: str, value: int, expires_in=ONE_DAY) -> None:
        return await self.store.set(key, self.__int_to_bytes(value), expires_in)

    async def get_or_set_int(
        self,
        key: str,
        awaitable: Awaitable[int],
        expires_in=ONE_DAY,
    ) -> int:
        maybe_key = await self.get_int(key)
        if maybe_key:
            return maybe_key
        else:
            value = await awaitable
            await self.set_int(key, value, expires_in)
            return value

    def __float_to_bytes(self, number: float) -> bytes:
        return struct.pack(">f", number)

    def __bytes_to_float(self, number: bytes) -> float:
        return struct.unpack(">f", number)[0]

    async def get_float(self, key: str) -> Optional[float]:
        maybe_key = await self.store.get(key)
        return self.__bytes_to_float(maybe_key) if maybe_key else None

    async def set_float(self, key: str, value: float, expires_in=ONE_DAY) -> None:
        return await self.store.set(key, self.__float_to_bytes(value), expires_in)

    async def get_or_set_float(
        self,
        key: str,
        awaitable: Awaitable[float],
        expires_in=ONE_DAY,
    ) -> float:
        maybe_key = await self.get_float(key)
        if maybe_key:
            return maybe_key
        else:
            value = await awaitable
            await self.set_float(key, value, expires_in)
            return value

    def __string_to_bytes(self, text: str) -> bytes:
        return text.encode("utf-8")

    def __bytes_to_string(self, text: bytes) -> str:
        return text.decode("utf-8")

    async def get_str(self, key: str) -> Optional[str]:
        maybe_key = await self.store.get(key)
        return self.__bytes_to_string(maybe_key) if maybe_key else None

    async def set_str(self, key: str, value: str, expires_in=ONE_DAY) -> None:
        return await self.store.set(key, self.__string_to_bytes(value), expires_in)

    async def get_or_set_str(
        self,
        key: str,
        awaitable: Awaitable[str],
        expires_in=ONE_DAY,
    ) -> str:
        maybe_key = await self.get_str(key)
        if maybe_key:
            return maybe_key
        else:
            value = await awaitable
            await self.set_str(key, value, expires_in)
            return value

    async def get_dict(self, key: str) -> Optional[dict]:
        maybe_key = await self.get_str(key)
        return json.loads(maybe_key) if maybe_key else None

    async def set_dict(self, key: str, value: dict, expires_in=ONE_DAY) -> None:
        return await self.set_str(key, json.dumps(value), expires_in)

    async def get_or_set_dict(
        self,
        key: str,
        awaitable: Awaitable[BaseModel],
        expires_in=ONE_DAY,
    ) -> BaseModel:
        maybe_key = await self.get_dict(key)
        if maybe_key:
            return maybe_key
        else:
            value = await awaitable
            await self.set_dict(key, value, expires_in)
            return value

    async def get_model(self, key: str, model: Type[BaseModel]) -> Optional[BaseModel]:
        maybe_key = await self.get_str(key)
        return model.model_validate_json(maybe_key) if maybe_key else None

    async def set_model(self, key: str, value: BaseModel, expires_in=ONE_DAY) -> None:
        return await self.set_str(key, value.model_dump_json(), expires_in)

    async def get_or_set_model(
        self,
        key: str,
        model: Type[BaseModel],
        awaitable: Awaitable[BaseModel],
        expires_in=ONE_DAY,
    ) -> BaseModel:
        maybe_key = await self.get_model(key, model)
        if maybe_key:
            return maybe_key
        else:
            value = await awaitable
            await self.set_model(key, value, expires_in)
            return value
