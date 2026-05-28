<?php

namespace Database\Factories;

use App\Models\LabOrder;
use App\Models\LabOrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LabOrderItem>
 */
class LabOrderItemFactory extends Factory
{
    protected $model = LabOrderItem::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tests = [
            ['code' => 'NFS', 'name' => 'Numération formule sanguine', 'category' => 'hematology', 'specimen' => 'blood'],
            ['code' => 'GLY', 'name' => 'Glycémie à jeun', 'category' => 'biochemistry', 'specimen' => 'blood'],
            ['code' => 'CHL', 'name' => 'Cholestérol total', 'category' => 'biochemistry', 'specimen' => 'blood'],
            ['code' => 'TSH', 'name' => 'TSH ultra-sensible', 'category' => 'endocrinology', 'specimen' => 'blood'],
            ['code' => 'INR', 'name' => 'INR (Taux de prothrombine)', 'category' => 'coagulation', 'specimen' => 'blood'],
        ];

        $test = fake()->randomElement($tests);

        return [
            'lab_order_id' => LabOrder::factory(),
            'test_code' => $test['code'],
            'test_name' => $test['name'],
            'test_category' => $test['category'],
            'specimen_type' => $test['specimen'],
            'result_status' => 'pending',
        ];
    }

    public function withResult(string $result = 'Normal', string $status = 'normal'): static
    {
        return $this->state(fn () => [
            'result' => $result,
            'result_status' => $status,
            'result_date' => now()->toDateString(),
            'is_abnormal' => $status !== 'normal',
        ]);
    }

    public function critical(): static
    {
        return $this->state(fn () => [
            'result' => 'Hb 5.2 g/dL',
            'result_status' => 'critical',
            'is_abnormal' => true,
            'is_critical' => true,
            'result_date' => now()->toDateString(),
        ]);
    }
}
