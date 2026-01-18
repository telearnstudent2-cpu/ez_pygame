import pygame
import sys
import random

# 初始化 Pygame
pygame.init()

# 設定視窗
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Pygame Sprite 系統範例")

# 定義顏色
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GOLD = (255, 215, 0)

# 遊戲參數
PLAYER_SPEED = 8
COIN_SPEED = 5

# --- 類別定義 ---

class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        # 建立玩家外觀
        try:
            # 嘗試載入圖片
            self.image = pygame.image.load("stephen_curry.png").convert()
            # 設定去背顏色 (黑色)
            self.image.set_colorkey(BLACK)
            self.image = pygame.transform.scale(self.image, (90, 90))
        except Exception as e:
            print(f"無法載入圖片: {e}，使用預設白色方塊")
            self.image = pygame.Surface((90, 90))
            self.image.fill(WHITE)
        # 設定位置矩形
        self.rect = self.image.get_rect()
        self.rect.centerx = SCREEN_WIDTH // 2
        self.rect.bottom = SCREEN_HEIGHT - 10

    def update(self):
        """處理玩家移動邏輯"""
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] and self.rect.left > 0:
            self.rect.x -= PLAYER_SPEED
        if keys[pygame.K_RIGHT] and self.rect.right < SCREEN_WIDTH:
            self.rect.x += PLAYER_SPEED

class Coin(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        # 建立金幣外觀 (籃球)
        self.radius = 15
        try:
            self.image = pygame.image.load("basketball.png").convert()
            # 設定去背顏色 (黑色)
            self.image.set_colorkey(BLACK)
            self.image = pygame.transform.scale(self.image, (50, 50))
        except Exception as e:
            print(f"無法載入籃球圖片: {e}，使用預設金色圓形")
            self.image = pygame.Surface((50, 50), pygame.SRCALPHA)
            pygame.draw.circle(self.image, GOLD, (25, 25), 25)
            
        # 設定位置矩形
        self.rect = self.image.get_rect()
        self.spawn()

    def spawn(self):
        """重置金幣位置到頂端隨機處"""
        self.rect.x = random.randint(0, SCREEN_WIDTH - self.rect.width)
        self.rect.y = -self.rect.height

    def update(self):
        """金幣掉落與邊界檢查"""
        self.rect.y += COIN_SPEED
        
        # 取得全域分數變數進行扣分
        if self.rect.top > SCREEN_HEIGHT:
            global score
            score -= 5
            self.spawn()

# --- 遊戲初始化 ---

# 建立 Sprite 群組
all_sprites = pygame.sprite.Group()
coins = pygame.sprite.Group()

# 建立物件實例
player = Player()
all_sprites.add(player)

# 建立金幣 (可以輕鬆增加多個金幣)
for i in range(1):
    coin = Coin()
    all_sprites.add(coin)
    coins.add(coin)

# 分數與字體
score = 0
font = pygame.font.SysFont("Arial", 36)
clock = pygame.time.Clock()

def main():
    global score
    
    running = True
    while running:
        # 1. 事件處理
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        # 2. 更新 (會呼叫群組內所有 Sprite 的 update 方法)
        all_sprites.update()

        # --- 碰撞偵測 (使用 Sprite Group 內建功能) ---
        # dokill=False 因為我們要手動 reset 它到頂端而不是真的刪除
        hits = pygame.sprite.spritecollide(player, coins, False)
        for hit in hits:
            score += 10
            hit.spawn()

        # 3. 繪製
        screen.fill(BLACK)
        
        # 繪製群組內的所有物件
        all_sprites.draw(screen)

        # 繪製分數
        score_surface = font.render(f"Score: {score}", True, WHITE)
        screen.blit(score_surface, (10, 10))

        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()