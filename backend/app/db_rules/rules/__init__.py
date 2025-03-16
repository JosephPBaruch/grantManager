from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/rules")

class Item(BaseModel):
    id: int = Field(0,gt=0, le=100)
    data: str = Field("")

TEMP = {
    1: Item(id=1, data="Hello"),
    2: Item(id=2, data="World"),
}

@router.get("/")
async  def read_root():
    return TEMP


@router.get("/items/{item_id}")
async def read_item(item_id: int):
    return TEMP.get(item_id, None)


@router.post("/items", response_model=Item)
async def set_item(item:Item):
    TEMP[item.id] = item
    return item

